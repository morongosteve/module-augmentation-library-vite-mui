# React Native Mobile App with iOS ML Integration

This is the React Native version of the components library with integrated iOS Machine Learning capabilities using Core ML and llama.rn.

## Features

- **On-Device ML Inference**: Run LLMs directly on iPhone with llama.rn
- **Core ML Support**: Native iOS ML integration with Apple's Core ML framework
- **Neural Engine Optimization**: Automatic use of Apple Neural Engine for best performance
- **Pre-configured Models**: Ready-to-use model configurations (Llama 3.2, Phi-3, Gemma, etc.)
- **React Hooks**: Easy-to-use hooks for model management and inference
- **TypeScript**: Full type safety throughout the codebase

## Requirements

### For iOS Development

- macOS with Xcode 14.0 or later
- CocoaPods installed (`sudo gem install cocoapods`)
- Node.js 18 or later
- iPhone 12 or newer (A14 Bionic chip or later) for best performance
- iOS 14.0 or later

### For Android Development

- Android Studio
- Android SDK 28 or later
- Java 11 or later

## Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. iOS Setup

```bash
# Install iOS dependencies
cd ios
pod install
cd ..

# Or use the npm script
npm run pod-install
```

### 3. Run the App

```bash
# iOS
npm run ios

# Android
npm run android
```

## Using ML Models

### Basic Usage with Hooks

```typescript
import { useMLModel } from './src/hooks';
import { LLAMA_3_2_1B_Q4 } from './src/ml/modelConfigs';

function MyComponent() {
  const { loadModel, runInference, isModelLoaded } = useMLModel(LLAMA_3_2_1B_Q4);

  useEffect(() => {
    loadModel(); // Downloads and loads the model
  }, []);

  const handleGenerate = async () => {
    const result = await runInference('Hello, how are you?', {
      temperature: 0.7,
      maxTokens: 100,
    });
    console.log(result.text);
  };

  return (
    <View>
      <Button onPress={handleGenerate} disabled={!isModelLoaded}>
        Generate
      </Button>
    </View>
  );
}
```

### Using MLService Directly

```typescript
import MLService from './src/ml/MLService';
import { LLAMA_3_2_1B_Q4 } from './src/ml/modelConfigs';

// Load model
await MLService.loadModel(LLAMA_3_2_1B_Q4);

// Run inference
const result = await MLService.runInference(
  'llama-3.2-1b-instruct-q4',
  'What is the capital of France?',
  {
    temperature: 0.7,
    maxTokens: 50,
  }
);

console.log(result.text);
```

### Checking Device Capabilities

```typescript
import { useDeviceCapabilities } from './src/hooks';

function DeviceInfo() {
  const { capabilities, isLoading } = useDeviceCapabilities();

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <Text>Device: {capabilities?.device}</Text>
      <Text>Neural Engine: {capabilities?.neuralEngine ? 'Yes' : 'No'}</Text>
      <Text>Memory: {capabilities?.physicalMemoryGB.toFixed(1)} GB</Text>
    </View>
  );
}
```

## Available Pre-configured Models

### LLMs (GGUF Format)

1. **Llama 3.2 1B** - Lightweight, fast, ~700MB
   - Best for: General chat, Q&A
   - Memory requirement: 1GB

2. **Llama 3.2 3B** - Advanced reasoning, ~2GB
   - Best for: Complex tasks, code generation
   - Memory requirement: 3GB

3. **Phi-3 Mini** - Microsoft's efficient model, ~2.3GB
   - Best for: Balanced performance
   - Memory requirement: 3GB

4. **Gemma 2B** - Google's compact model, ~1.6GB
   - Best for: Privacy-focused apps
   - Memory requirement: 2GB

5. **TinyLlama 1.1B** - Ultra-compact, ~670MB
   - Best for: Testing, low-end devices
   - Memory requirement: 1GB

### Vision Models (Core ML - iOS Only)

1. **Stable Diffusion 2.1** - Image generation, ~2.5GB
   - Best for: Text-to-image generation
   - Memory requirement: 4GB
   - Platform: iOS only

## Custom Model Configuration

```typescript
import { ModelConfig, ModelType, ModelFormat } from './src/ml/types';

const customModel: ModelConfig = {
  id: 'my-custom-model',
  name: 'My Custom Model',
  type: ModelType.LLM,
  format: ModelFormat.GGUF,
  remoteUrl: 'https://example.com/model.gguf',
  size: 1_000_000_000, // 1GB
  requiredMemory: 2048, // 2GB
  contextLength: 4096,
  metadata: {
    description: 'My custom fine-tuned model',
    license: 'MIT',
  },
};
```

## Core ML Integration (iOS)

### Loading Core ML Models

```typescript
import { NativeModules } from 'react-native';
const { MLKitBridge } = NativeModules;

// Load Core ML model
const result = await MLKitBridge.loadCoreMLModel('/path/to/model.mlmodel');

// Get model info
const info = await MLKitBridge.getModelInfo('/path/to/model.mlmodel');
console.log(info.author, info.description);
```

### Converting PyTorch Models to Core ML

```bash
# Install coremltools
pip install coremltools

# Convert model (Python)
import coremltools as ct

# Load your PyTorch model
model = YourPyTorchModel()

# Trace and convert
traced_model = torch.jit.trace(model, example_input)
coreml_model = ct.convert(
    traced_model,
    inputs=[ct.TensorType(shape=input_shape)]
)

# Save
coreml_model.save("MyModel.mlmodel")
```

## Model Storage

Models are stored in the app's documents directory:
```
/Documents/models/
```

### Storage Utilities

```typescript
import {
  getDownloadedModels,
  getAvailableStorage,
  deleteModel,
  hasEnoughSpace,
} from './src/utils/modelStorage';

// Check downloaded models
const models = await getDownloadedModels();

// Check storage
const hasSpace = await hasEnoughSpace(2_000_000_000); // 2GB

// Delete a model
await deleteModel('llama-3.2-1b-instruct-q4', 'gguf');
```

## Performance Tips

### iOS Optimization

1. **Use Quantized Models**: Q4 quantization reduces size by ~75% with minimal quality loss
2. **Leverage Neural Engine**: Models automatically use Apple Neural Engine on A14+ chips
3. **Context Length**: Smaller context = faster inference
4. **Temperature**: Lower temperature = faster, more deterministic output

### Memory Management

```typescript
// Unload model when not needed
await MLService.unloadModel('model-id');

// Check memory before loading
const capabilities = await MLService.getDeviceCapabilities();
if (capabilities.physicalMemoryGB < 4) {
  // Load smaller model
}
```

## Troubleshooting

### Model Download Fails

- Check internet connection
- Verify storage space with `getAvailableStorage()`
- Try downloading smaller model first

### Out of Memory

- Use smaller quantized models (Q4 instead of Q8)
- Reduce context length
- Unload unused models
- Close other apps

### Slow Inference

- Ensure using A14+ chip (iPhone 12+)
- Check if Neural Engine is available
- Reduce max tokens
- Use smaller model

## File Structure

```
mobile/
├── src/
│   ├── ml/
│   │   ├── MLService.ts          # Main ML service
│   │   ├── types.ts              # TypeScript types
│   │   ├── modelConfigs.ts       # Pre-configured models
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useMLModel.ts         # ML model hook
│   │   ├── useDeviceCapabilities.ts
│   │   └── index.ts
│   ├── utils/
│   │   └── modelStorage.ts       # Storage utilities
│   └── components/
│       └── MLChatExample.tsx     # Example component
├── ios/
│   ├── Podfile
│   ├── MLKitBridge.swift         # Core ML bridge
│   ├── MLKitBridge.m
│   └── Info.plist
├── android/
├── package.json
├── tsconfig.json
└── metro.config.js
```

## Resources

### Model Sources

- **Hugging Face**: https://huggingface.co/models
- **Apple Core ML Models**: https://huggingface.co/apple
- **GGUF Models**: Search for "GGUF" on Hugging Face

### Documentation

- **llama.rn**: https://github.com/mybigday/llama.rn
- **Core ML**: https://developer.apple.com/documentation/coreml
- **React Native**: https://reactnative.dev

### Recommended Devices

- iPhone 15 Pro/Pro Max (A17 Pro) - Best performance
- iPhone 14 Pro/Pro Max (A16 Bionic) - Excellent
- iPhone 13 Pro/Pro Max (A15 Bionic) - Very good
- iPhone 12+ (A14 Bionic) - Good

## License

See the main project LICENSE file.
