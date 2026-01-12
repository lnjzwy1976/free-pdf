#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(LanTransferModule, RCTEventEmitter)

// 说明：
// RN 在 JS 侧订阅/取消订阅事件时，会调用原生模块的 addListener / removeListeners。
// 如果不导出这两个方法，JS 侧用 new NativeEventEmitter(LanTransferModule) 会出现警告：
// `new NativeEventEmitter()` was called with a non-null argument without the required addListener/removeListeners method.
// 这里只做“导出”，不改变你现有的上传/写文件逻辑。
RCT_EXTERN_METHOD(addListener:(NSString *)eventName)
RCT_EXTERN_METHOD(removeListeners:(double)count)

RCT_EXTERN_METHOD(getIpAddress:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(start:(NSString *)html
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stop)

@end
