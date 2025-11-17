//
//  MLKitBridge.m
//  ComponentsLibraryMobile
//
//  Objective-C bridge for MLKitBridge
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MLKitBridge, NSObject)

RCT_EXTERN_METHOD(loadCoreMLModel:(NSString *)modelPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getModelInfo:(NSString *)modelPath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getDeviceCapabilities:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
