//
//  LanTransferModule.swift
//  freepdf
//
//  局域网传输模块 - Swift 实现
//  使用 GCDWebServer 处理 HTTP 请求和文件上传
//

import Foundation
import React
import GCDWebServer

@objc(LanTransferModule)
class LanTransferModule: RCTEventEmitter {
    
    // HTTP 服务器实例
    private var webServer: GCDWebServer?
    
    // 是否有监听者
    private var hasListeners = false
    
    // MARK: - React Native 模块配置
    
    override static func moduleName() -> String! {
        return "LanTransferModule"
    }
    
    /// 支持的事件名列表
    override func supportedEvents() -> [String]! {
        return ["onUploadStart", "onUploadProgress", "onUploadComplete", "onUploadError"]
    }
    
    /// 标记为需要主队列执行
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    override func startObserving() {
        hasListeners = true
    }
    
    override func stopObserving() {
        hasListeners = false
    }
    
    // MARK: - 公开方法
    
    /// 启动 HTTP 服务器
    /// - Parameters:
    ///   - htmlContent: 上传页面的 HTML 内容
    ///   - resolve: Promise resolve 回调
    ///   - reject: Promise reject 回调
    @objc func start(_ htmlContent: String,
                     resolver resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        // 如果已有服务器在运行，先停止
        if webServer != nil {
            webServer?.stop()
            webServer = nil
        }
        
        // 创建新的服务器实例
        webServer = GCDWebServer()
        
        guard let server = webServer else {
            reject("SERVER_ERROR", "Failed to create server", nil)
            return
        }
        
        // 处理根路径 GET 请求 - 返回上传页面
        server.addHandler(forMethod: "GET", path: "/", request: GCDWebServerRequest.self) { _ in
            return GCDWebServerDataResponse(html: htmlContent)
        }
        
        // 处理文件上传 POST 请求
        server.addHandler(forMethod: "POST", pathRegex: "/api/upload.*", request: GCDWebServerDataRequest.self) { [weak self] request in
            return self?.handleUpload(request: request as! GCDWebServerDataRequest)
        }
        
        // 启动服务器，使用随机端口
        do {
            try server.start(options: [
                GCDWebServerOption_Port: 0, // 0 表示自动选择可用端口
                GCDWebServerOption_BindToLocalhost: false,
                GCDWebServerOption_AutomaticallySuspendInBackground: false
            ])
            
            let port = server.port
            print("[LanTransfer] Server started on port \(port)")
            resolve(NSNumber(value: port))
            
        } catch {
            reject("SERVER_ERROR", error.localizedDescription, error)
        }
    }
    
    /// 停止 HTTP 服务器
    @objc func stop() {
        webServer?.stop()
        webServer = nil
        print("[LanTransfer] Server stopped")
    }
    
    /// 获取设备 IP 地址
    @objc func getIpAddress(_ resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
        if let ip = getWiFiAddress() {
            resolve(ip)
        } else {
            resolve(NSNull())
        }
    }
    
    // MARK: - 私有方法
    
    /// 处理文件上传请求
    private func handleUpload(request: GCDWebServerDataRequest) -> GCDWebServerResponse {
        
        // 获取文件名
        var fileName = "uploaded.pdf"
        if let encodedName = request.headers["X-File-Name"] as? String,
           let decodedName = encodedName.removingPercentEncoding {
            fileName = decodedName
        }
        
        // 获取 Content-Length
        let totalSize = request.contentLength
        
        print("[LanTransfer] Upload started: \(fileName), size: \(totalSize)")
        
        // 发送上传开始事件
        sendEvent(withName: "onUploadStart", body: [
            "fileName": fileName,
            "totalSize": totalSize
        ])
        
        // 获取请求体数据 (Base64 编码的文件内容)
        guard let base64Data = request.data else {
            sendEvent(withName: "onUploadError", body: ["message": "No data received"])
            return GCDWebServerDataResponse(text: "No data")!
        }
        
        // 发送进度 (收到数据后)
        sendEvent(withName: "onUploadProgress", body: [
            "totalSize": totalSize,
            "receivedSize": base64Data.count
        ])
        
        // 将 Data 转换为 Base64 字符串，然后解码
        guard let base64String = String(data: base64Data, encoding: .utf8),
              let decodedData = Data(base64Encoded: base64String, options: .ignoreUnknownCharacters) else {
            sendEvent(withName: "onUploadError", body: ["message": "Failed to decode Base64"])
            return GCDWebServerDataResponse(text: "Decode failed")!
        }
        
        // 保存到临时文件
        let tempDir = FileManager.default.temporaryDirectory
        let timestamp = Int(Date().timeIntervalSince1970 * 1000)
        let tempPath = tempDir.appendingPathComponent("upload_\(timestamp)_\(fileName)")
        
        do {
            try decodedData.write(to: tempPath)
            print("[LanTransfer] File saved: \(tempPath.path), size: \(decodedData.count)")
            
            // 发送上传完成事件
            sendEvent(withName: "onUploadComplete", body: [
                "filePath": tempPath.absoluteString, // file:// URL
                "fileName": fileName
            ])
            
            return GCDWebServerDataResponse(text: "Success")!
            
        } catch {
            print("[LanTransfer] Save error: \(error)")
            sendEvent(withName: "onUploadError", body: ["message": error.localizedDescription])
            return GCDWebServerDataResponse(text: "Save failed: \(error.localizedDescription)")!
        }
    }
    
    /// 获取 WiFi IP 地址
    private func getWiFiAddress() -> String? {
        var address: String?
        var ifaddr: UnsafeMutablePointer<ifaddrs>?
        
        guard getifaddrs(&ifaddr) == 0 else { return nil }
        defer { freeifaddrs(ifaddr) }
        
        var ptr = ifaddr
        while ptr != nil {
            defer { ptr = ptr?.pointee.ifa_next }
            
            let interface = ptr?.pointee
            let addrFamily = interface?.ifa_addr.pointee.sa_family
            
            // 只处理 IPv4
            guard addrFamily == UInt8(AF_INET) else { continue }
            
            // 获取接口名
            guard let name = interface?.ifa_name else { continue }
            let interfaceName = String(cString: name)
            
            // 只获取 WiFi 接口 (en0)
            guard interfaceName == "en0" else { continue }
            
            // 转换地址
            var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
            if let addr = interface?.ifa_addr {
                getnameinfo(addr, socklen_t(addr.pointee.sa_len),
                           &hostname, socklen_t(hostname.count),
                           nil, socklen_t(0), NI_NUMERICHOST)
                address = String(cString: hostname)
            }
        }
        
        return address
    }
}
