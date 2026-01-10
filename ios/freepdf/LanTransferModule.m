//
//  LanTransferModule.m
//  freepdf
//
//  局域网传输模块 - Objective-C 桥接文件
//  此文件将 Swift 模块暴露给 React Native
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(LanTransferModule, RCTEventEmitter)

// 启动 HTTP 服务器
// 参数: htmlContent - 上传页面的 HTML 内容
// 返回: Promise<Int> - 服务器监听的端口号
RCT_EXTERN_METHOD(start:(NSString *)htmlContent
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// 停止 HTTP 服务器
RCT_EXTERN_METHOD(stop)

// 获取设备 IP 地址
RCT_EXTERN_METHOD(getIpAddress:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
