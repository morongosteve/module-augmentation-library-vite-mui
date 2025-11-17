# iOS ML Setup Guide

Complete guide for setting up iOS Machine Learning capabilities in your React Native app.

## Prerequisites

- macOS (required for iOS development)
- Xcode 14.0 or later
- iOS device with A14 Bionic chip or later (iPhone 12+) for best performance
- CocoaPods installed
- Apple Developer account (for device testing)

## Step 1: Install Dependencies

```bash
cd mobile
npm install
```

## Step 2: Install iOS Native Dependencies

```bash
cd ios
pod install
cd ..
```

## Step 3: Configure Xcode Project

1. Open the workspace in Xcode:
   ```bash
   open ios/ComponentsLibraryMobile.xcworkspace
   ```

2. Select your project in the Project Navigator

3. Under "Signing & Capabilities":
   - Select your development team
   - Choose a unique bundle identifier

4. Under "Build Settings":
   - Set "iOS Deployment Target" to 14.0 or later
   - Verify "Swift Language Version" is set to Swift 5.0+

## Step 4: Add Required Capabilities

In Xcode, go to your target's "Signing & Capabilities" tab:

1. Click "+ Capability"
2. Add "Increased Memory Limit" (optional but recommended for larger models)

## Step 5: Configure Info.plist

The following permissions are already configured in `ios/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>This app requires camera access for ML features</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app requires photo library access for ML features</string>
```

Customize these messages to match your app's use case.

## Step 6: Add Core ML Framework

The Podfile already includes Core ML:

```ruby
pod 'CoreML'
```

If you need to manually add it:

1. Select your target in Xcode
2. Go to "Build Phases" → "Link Binary With Libraries"
3. Click "+" and add "CoreML.framework"

## Step 7: Configure Memory Settings

For large models, you may need to increase memory limits:

1. In Xcode, select your target
2. Go to "Signing & Capabilities"
3. Click "+ Capability" → "Increased Memory Limit"

## Step 8: Test Installation

Run the app on a physical device:

```bash
npm run ios -- --device="Your iPhone Name"
```

Or run on simulator (limited ML capabilities):

```bash
npm run ios
```

## Verifying ML Capabilities

Use the device capabilities check:

```typescript
import MLService from './src/ml/MLService';

const capabilities = await MLService.getDeviceCapabilities();
console.log(capabilities);
// {
//   neuralEngine: true,
//   device: "iPhone 14 Pro",
//   systemVersion: "17.0",
//   physicalMemoryGB: 6.0
// }
```

## Troubleshooting

### Pod Install Fails

```bash
# Clear CocoaPods cache
cd ios
pod cache clean --all
pod deintegrate
pod install
cd ..
```

### Build Fails with Swift Errors

1. Ensure Swift version is compatible (5.0+)
2. Clean build folder: Product → Clean Build Folder in Xcode
3. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

### Metal/Neural Engine Not Available

- Ensure running on A14+ device (iPhone 12 or newer)
- Simulator has limited ML capabilities
- Check iOS version is 14.0+

### Memory Warnings

- Use smaller quantized models (Q4 instead of Q8)
- Reduce context length
- Enable "Increased Memory Limit" capability
- Close other apps

## Recommended Xcode Settings

### Build Settings

```
SWIFT_VERSION = 5.0
IPHONEOS_DEPLOYMENT_TARGET = 14.0
ENABLE_BITCODE = NO
```

### Optimization

For Release builds:
```
SWIFT_OPTIMIZATION_LEVEL = -O
GCC_OPTIMIZATION_LEVEL = s
```

## Adding Custom Core ML Models

### Option 1: Drag and Drop

1. Drag your `.mlmodel` or `.mlpackage` file into Xcode
2. Ensure "Target Membership" includes your app target
3. Xcode will automatically generate Swift interface

### Option 2: Programmatic Loading

```swift
import CoreML

let modelURL = Bundle.main.url(forResource: "MyModel", withExtension: "mlmodelc")!
let model = try MLModel(contentsOf: modelURL)
```

### Option 3: Download at Runtime

Use the MLService to download and load:

```typescript
const customModel: ModelConfig = {
  id: 'my-model',
  name: 'My Custom Model',
  type: ModelType.VISION,
  format: ModelFormat.CORE_ML,
  remoteUrl: 'https://example.com/MyModel.mlmodel',
  size: 100_000_000,
  requiredMemory: 512,
};

await MLService.loadModel(customModel);
```

## Performance Optimization

### Use Neural Engine

The bridge automatically configures models to use Neural Engine:

```swift
configuration.computeUnits = .cpuAndNeuralEngine
```

### Metal GPU Acceleration

For GGUF models with llama.rn:

```typescript
const context = await loadLlamaModel({
  model: modelPath,
  n_gpu_layers: 1, // Enable Metal on iOS
  use_mlock: true,
});
```

### Memory Management

```typescript
// Unload models when not in use
await MLService.unloadModel('model-id');

// Monitor memory
const info = await MLService.getDeviceCapabilities();
console.log(`Available memory: ${info.physicalMemoryGB} GB`);
```

## Deployment Checklist

- [ ] Test on physical iOS device (iPhone 12+)
- [ ] Verify Neural Engine is being used
- [ ] Test with production model sizes
- [ ] Monitor memory usage
- [ ] Test on lowest supported iOS version
- [ ] Verify offline functionality
- [ ] Test app backgrounding/foregrounding
- [ ] Check App Store size limits (4GB cellular download)

## Resources

- [Core ML Documentation](https://developer.apple.com/documentation/coreml)
- [Neural Engine Guide](https://developer.apple.com/documentation/coreml/core_ml_api/using_the_neural_engine)
- [Model Conversion Tools](https://apple.github.io/coremltools/)
- [llama.rn Documentation](https://github.com/mybigday/llama.rn)

## Next Steps

1. Review [Model Conversion Guide](./MODEL-CONVERSION.md)
2. Check out [Example Components](../src/components/MLChatExample.tsx)
3. Read [Performance Best Practices](./PERFORMANCE.md)
