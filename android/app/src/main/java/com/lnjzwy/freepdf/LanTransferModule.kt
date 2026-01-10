package com.lnjzwy.freepdf

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import fi.iki.elonen.NanoHTTPD
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.net.Inet4Address
import java.net.NetworkInterface

/**
 * 局域网传输原生模块
 * 使用 NanoHTTPD 实现一个轻量级 HTTP 服务器，用于接收浏览器上传的 PDF 文件。
 * 直接在原生层解码 Base64 并写入磁盘，避免 JS 桥接的性能瓶颈。
 */
class LanTransferModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var server: HttpServer? = null

    override fun getName(): String {
        return "LanTransferModule"
    }

    /**
     * 启动 HTTP 服务器
     * @param htmlContent 要在根路径提供的 HTML 内容
     * @param promise 返回服务器监听的端口号
     */
    @ReactMethod
    fun start(htmlContent: String, promise: Promise) {
        try {
            if (server != null) {
                server?.stop()
            }
            
            // 端口 0 让系统自动分配可用端口
            server = HttpServer(0, htmlContent, reactApplicationContext)
            // 使用 5 秒超时，内网环境足够
            server?.start(5000, false)
            
            val actualPort = server?.listeningPort ?: 0
            promise.resolve(actualPort)
        } catch (e: Exception) {
            promise.reject("SERVER_ERROR", e.message)
        }
    }

    /**
     * 停止 HTTP 服务器
     */
    @ReactMethod
    fun stop() {
        server?.stop()
        server = null
    }

    /**
     * 获取设备的局域网 IP 地址
     */
    @ReactMethod
    fun getIpAddress(promise: Promise) {
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val iface = interfaces.nextElement()
                // 过滤回环地址和未激活的接口
                if (iface.isLoopback || !iface.isUp) continue

                val addresses = iface.inetAddresses
                while (addresses.hasMoreElements()) {
                    val addr = addresses.nextElement()
                    if (addr is Inet4Address) {
                        promise.resolve(addr.hostAddress)
                        return
                    }
                }
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("IP_ERROR", e.message)
        }
    }

    /**
     * 内部 HTTP 服务器类
     */
    private inner class HttpServer(port: Int, val html: String, val context: ReactApplicationContext) : NanoHTTPD(port) {

        override fun serve(session: IHTTPSession): Response {
            val method = session.method
            val uri = session.uri

            return when {
                Method.GET == method && "/" == uri -> {
                    // 返回上传页面 HTML
                    newFixedLengthResponse(Response.Status.OK, MIME_HTML, html)
                }
                Method.POST == method && uri.startsWith("/api/upload") -> {
                    handleUpload(session)
                }
                else -> {
                    newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "Not Found")
                }
            }
        }

        /**
         * 处理文件上传请求
         * 浏览器发送的是 Base64 编码的文件内容，我们需要解码后保存为二进制文件
         */
        private fun handleUpload(session: IHTTPSession): Response {
            try {
                val headers = session.headers
                val contentLengthStr = headers["content-length"] ?: "0"
                val totalSize = contentLengthStr.toLongOrNull() ?: 0L
                
                // 从请求头获取文件名
                val fileNameEncoded = headers["x-file-name"] ?: "uploaded.pdf"
                val fileName = java.net.URLDecoder.decode(fileNameEncoded, "UTF-8")

                android.util.Log.d("LanTransfer", "开始上传: $fileName, 大小: $totalSize bytes")

                // 通知 JS 层上传开始
                val paramsStart = Arguments.createMap()
                paramsStart.putString("fileName", fileName)
                paramsStart.putDouble("totalSize", totalSize.toDouble())
                sendEvent("onUploadStart", paramsStart)

                // 创建临时文件
                val cacheDir = context.cacheDir
                val tempFile = File(cacheDir, "upload_${System.currentTimeMillis()}_$fileName")
                
                // 用于跟踪原始字节读取进度的包装流
                var rawBytesRead: Long = 0
                var lastEmitTime: Long = System.currentTimeMillis()
                
                val rawInputStream = session.inputStream
                
                // 限制读取的字节数，避免等待连接关闭
                // NanoHTTPD 的 inputStream 是底层 socket 流，不会在 body 结束后自动返回 EOF
                var remainingBytes = totalSize
                
                // 创建一个限制读取字节数并跟踪进度的包装 InputStream
                val limitedTrackingInputStream = object : InputStream() {
                    override fun read(): Int {
                        if (remainingBytes <= 0) return -1
                        val b = rawInputStream.read()
                        if (b != -1) {
                            remainingBytes--
                            rawBytesRead++
                            emitProgressIfNeeded()
                        }
                        return b
                    }
                    
                    override fun read(buffer: ByteArray, offset: Int, length: Int): Int {
                        if (remainingBytes <= 0) return -1
                        // 只读取剩余需要的字节数
                        val toRead = minOf(length.toLong(), remainingBytes).toInt()
                        val bytesRead = rawInputStream.read(buffer, offset, toRead)
                        if (bytesRead > 0) {
                            remainingBytes -= bytesRead
                            rawBytesRead += bytesRead
                            emitProgressIfNeeded()
                        }
                        return bytesRead
                    }
                    
                    private fun emitProgressIfNeeded() {
                        val now = System.currentTimeMillis()
                        // 节流：每 200ms 最多发送一次进度事件
                        if (now - lastEmitTime > 200) {
                            val params = Arguments.createMap()
                            params.putDouble("totalSize", totalSize.toDouble())
                            params.putDouble("receivedSize", rawBytesRead.toDouble())
                            sendEvent("onUploadProgress", params)
                            lastEmitTime = now
                        }
                    }
                }
                
                // 将限制流包装为 Base64 解码流
                // 浏览器发送的是 Base64 文本，我们需要解码为二进制
                val decodingStream = android.util.Base64InputStream(
                    limitedTrackingInputStream, 
                    android.util.Base64.DEFAULT
                )
                
                // 读取解码后的数据并写入文件
                FileOutputStream(tempFile).use { fos ->
                    val buffer = ByteArray(8192) // 8KB 缓冲区
                    var bytesRead: Int
                    
                    while (decodingStream.read(buffer).also { bytesRead = it } != -1) {
                        fos.write(buffer, 0, bytesRead)
                    }
                }
                
                decodingStream.close()
                
                android.util.Log.d("LanTransfer", "上传完成: ${tempFile.absolutePath}, 文件大小: ${tempFile.length()} bytes")

                // 发送最终进度
                val paramsEnd = Arguments.createMap()
                paramsEnd.putDouble("totalSize", totalSize.toDouble())
                paramsEnd.putDouble("receivedSize", rawBytesRead.toDouble())
                sendEvent("onUploadProgress", paramsEnd)
                
                // 通知上传完成，路径需要 file:// 前缀供 Expo FileSystem 使用
                val paramsComplete = Arguments.createMap()
                paramsComplete.putString("filePath", "file://${tempFile.absolutePath}")
                paramsComplete.putString("fileName", fileName)
                sendEvent("onUploadComplete", paramsComplete)
                
                return newFixedLengthResponse(Response.Status.OK, MIME_PLAINTEXT, "Success")
                
            } catch (e: Exception) {
                android.util.Log.e("LanTransfer", "上传错误: ${e.message}", e)
                val paramsErr = Arguments.createMap()
                paramsErr.putString("message", e.message ?: "Unknown error")
                sendEvent("onUploadError", paramsErr)
                return newFixedLengthResponse(Response.Status.INTERNAL_ERROR, MIME_PLAINTEXT, e.message)
            }
        }
        
        /**
         * 向 JS 层发送事件
         */
        private fun sendEvent(eventName: String, params: WritableMap?) {
            context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }
}
