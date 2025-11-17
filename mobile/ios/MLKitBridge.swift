//
//  MLKitBridge.swift
//  ComponentsLibraryMobile
//
//  Core ML integration bridge for React Native
//

import Foundation
import CoreML

@objc(MLKitBridge)
class MLKitBridge: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  // MARK: - Model Loading

  @objc
  func loadCoreMLModel(
    _ modelPath: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let url = URL(fileURLWithPath: modelPath)
      let compiledUrl = try MLModel.compileModel(at: url)
      let configuration = MLModelConfiguration()

      // Use Neural Engine if available
      if #available(iOS 16.0, *) {
        configuration.computeUnits = .cpuAndNeuralEngine
      } else {
        configuration.computeUnits = .all
      }

      let model = try MLModel(contentsOf: compiledUrl, configuration: configuration)

      resolve([
        "success": true,
        "modelPath": compiledUrl.path,
        "message": "Core ML model loaded successfully"
      ])
    } catch {
      reject("MODEL_LOAD_ERROR", "Failed to load Core ML model: \(error.localizedDescription)", error)
    }
  }

  // MARK: - Model Information

  @objc
  func getModelInfo(
    _ modelPath: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let url = URL(fileURLWithPath: modelPath)
      let compiledUrl = try MLModel.compileModel(at: url)
      let model = try MLModel(contentsOf: compiledUrl)

      let metadata = model.modelDescription.metadata

      resolve([
        "author": metadata[.author] ?? "Unknown",
        "license": metadata[.license] ?? "Unknown",
        "description": metadata[.description] ?? "No description",
        "version": metadata[.versionString] ?? "Unknown"
      ])
    } catch {
      reject("MODEL_INFO_ERROR", "Failed to get model info: \(error.localizedDescription)", error)
    }
  }

  // MARK: - Device Capabilities

  @objc
  func getDeviceCapabilities(
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    var capabilities: [String: Any] = [:]

    // Check Neural Engine availability
    if #available(iOS 14.0, *) {
      capabilities["neuralEngine"] = true
    } else {
      capabilities["neuralEngine"] = false
    }

    // Get device info
    capabilities["device"] = UIDevice.current.model
    capabilities["systemVersion"] = UIDevice.current.systemVersion

    // Memory info
    let physicalMemory = ProcessInfo.processInfo.physicalMemory
    capabilities["physicalMemoryGB"] = Double(physicalMemory) / 1_073_741_824.0

    resolve(capabilities)
  }
}
