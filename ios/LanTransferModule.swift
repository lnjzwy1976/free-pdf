//
//  LanTransferModule.swift
//  freepdf
//
//  Created by Cursor AI.
//

import Foundation
import React
// 说明：GCDWebServer 是通过 Bridging Header (`freepdf/freepdf-Bridging-Header.h`) 引入的 Objective-C 库
// 在 Swift 中不需要也无法 `import GCDWebServer`（否则会报 No such module）

@objc(LanTransferModule)
class LanTransferModule: RCTEventEmitter {
  private var webServer: GCDWebServer?
  private var uploadHTML: String = ""
  private var hasListeners = false

  override init() {
    super.init()
    // 重要：不要在 init() 里初始化 GCDWebServer
    // 原因：GCDWebServer 在 +initialize 阶段可能会触发 abort()（见你的 .ips 堆栈），导致 App 启动即闪退
    // 解决：延迟到 start() 时再创建，并强制在主线程执行
  }

  override func supportedEvents() -> [String]! {
    return ["onUploadStart", "onUploadProgress", "onUploadComplete", "onUploadError"]
  }
  
  override func startObserving() {
    hasListeners = true
  }
  
  override func stopObserving() {
    hasListeners = false
  }
  
  override static func moduleName() -> String! {
    return "LanTransferModule"
  }
  
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(getIpAddress:rejecter:)
  func getIpAddress(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
      var address: String?
      var ifaddr: UnsafeMutablePointer<ifaddrs>?
      
      // 1. 获取所有网络接口
      if getifaddrs(&ifaddr) == 0 {
          var ptr = ifaddr
          while ptr != nil {
              defer { ptr = ptr?.pointee.ifa_next }
              
              guard let interface = ptr?.pointee else { continue }
              let addrFamily = interface.ifa_addr.pointee.sa_family
              let name = String(cString: interface.ifa_name)
              
              // 2. 只看 IPv4 (AF_INET)
              if addrFamily == UInt8(AF_INET) {
                  var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
                  getnameinfo(interface.ifa_addr, socklen_t(interface.ifa_addr.pointee.sa_len),
                              &hostname, socklen_t(hostname.count),
                              nil, socklen_t(0), NI_NUMERICHOST)
                  let ip = String(cString: hostname)
                  
                  // Debug: 打印所有接口 IP
                  // print("[LanTransferModule] Interface: \(name), IP: \(ip)")
                  
                  // 3. 优先找 en0 (Wi-Fi)
                  if name == "en0" {
                      address = ip
                      // 找到了 Wi-Fi，直接用它
                      // 注意：有些情况 en0 可能是 169.254 (如果 Wi-Fi 连接但没 DHCP)，但通常这是最准确的接口
                  } else if address == nil && ip != "127.0.0.1" && !ip.starts(with: "169.254") {
                      // 备选：如果还没找到 en0，先暂存一个非本地、非 link-local 的地址 (比如 en1, bridge100)
                      address = ip
                  }
              }
          }
          freeifaddrs(ifaddr)
      }
      
      if let addr = address {
          // print("[LanTransferModule] Selected IP: \(addr)")
          resolve(addr)
      } else {
          // print("[LanTransferModule] No valid IP found")
          resolve(nil)
      }
  }

  @objc(start:resolver:rejecter:)
  func start(_ html: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    // 关键：强制在主线程创建/配置/启动，避免 GCDWebServer 在 +initialize 阶段 abort()
    DispatchQueue.main.async { [weak self] in
      guard let self = self else {
        reject("START_FAILED", "Module released", nil)
        return
      }

      // Prevent multiple starts
      if let server = self.webServer, server.isRunning {
        resolve(server.port)
        return
      }

      self.uploadHTML = html
      
      // 延迟创建
      if self.webServer == nil {
        self.webServer = GCDWebServer()
      }
      guard let server = self.webServer else {
        reject("START_FAILED", "Failed to create web server", nil)
        return
      }

      // Clear previous handlers
      server.removeAllHandlers()

      // 1. GET / -> Return HTML Page
      server.addHandler(
        forMethod: "GET",
        pathRegex: "^/$",
        request: GCDWebServerRequest.self,
        processBlock: { [weak self] _ in
          guard let self = self else { return GCDWebServerDataResponse(statusCode: 500) }
          return GCDWebServerDataResponse(html: self.uploadHTML)
        }
      )

      // 2. POST /api/upload -> Handle Base64 Upload (text/plain)
      server.addHandler(
        forMethod: "POST",
        path: "/api/upload",
        request: GCDWebServerDataRequest.self,
        processBlock: { [weak self] request in
          guard let self = self else { return GCDWebServerDataResponse(statusCode: 500) }
          guard let dataRequest = request as? GCDWebServerDataRequest else {
            return GCDWebServerDataResponse(statusCode: 400)
          }
          
          let fileNameEncoded = dataRequest.headers["X-File-Name"] ?? "uploaded.pdf"
          let fileName = fileNameEncoded.removingPercentEncoding ?? fileNameEncoded
          let totalSize = dataRequest.contentLength
          
          // if self.hasListeners {
            print("[LanTransferModule] Sending onUploadStart event...")
            self.sendEvent(withName: "onUploadStart", body: [
                "fileName": fileName,
                "totalSize": NSNumber(value: totalSize)
            ])
          // } else {
          //    print("[LanTransferModule] Warning: No listeners for onUploadStart")
          // }
          
          // 说明：GCDWebServerDataRequest.data 在当前版本是非 Optional（一定会有 Data 实例，可能为空）
          let base64Data = dataRequest.data
          
          if let base64String = String(data: base64Data, encoding: .utf8),
             let fileData = Data(base64Encoded: base64String, options: .ignoreUnknownCharacters) {
              
              let destPath = (NSTemporaryDirectory() as NSString).appendingPathComponent(fileName)
              
              do {
                  if FileManager.default.fileExists(atPath: destPath) {
                      try FileManager.default.removeItem(atPath: destPath)
                  }
                  try fileData.write(to: URL(fileURLWithPath: destPath))
                  
              // if self.hasListeners {
                  print("[LanTransferModule] Sending onUploadComplete event...")
                  // 说明：这里无法可靠做流式进度（当前前端发送的是 base64 文本，且 GCDWebServerDataRequest 会一次性读取 body）
                  // 所以我们在完成时直接上报 100%
                   self.sendEvent(withName: "onUploadProgress", body: [
                      "totalSize": NSNumber(value: totalSize),
                      "receivedSize": NSNumber(value: totalSize)
                  ])
                  self.sendEvent(withName: "onUploadComplete", body: [
                      "fileName": fileName,
                      "filePath": destPath
                  ])
              // }
                  return GCDWebServerDataResponse(statusCode: 200)
            } catch {
              // if self.hasListeners {
                self.sendEvent(withName: "onUploadError", body: ["message": error.localizedDescription])
              // }
              return GCDWebServerDataResponse(statusCode: 500)
            }
          }
          
          // if self.hasListeners {
            self.sendEvent(withName: "onUploadError", body: ["message": "Invalid data format"])
          // }
          return GCDWebServerDataResponse(statusCode: 400)
        }
      )

      do {
        try server.start(options: [
            GCDWebServerOption_Port: 0, // Auto port
            GCDWebServerOption_BindToLocalhost: false,
            GCDWebServerOption_AutomaticallySuspendInBackground: false
        ])
        
        if server.port > 0 {
            resolve(server.port)
        } else {
            reject("START_FAILED", "Failed to start server", nil)
        }
      } catch {
        reject("START_FAILED", error.localizedDescription, error)
      }
    }
  }

  @objc(stop)
  func stop() {
    // 重要：与 start 一致，统一在主线程停止，避免线程问题
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      if let server = self.webServer, server.isRunning {
        server.stop()
      }
    }
  }
}
