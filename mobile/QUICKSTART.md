# Quick Start Guide - iOS ML Integration

Get up and running with on-device ML on iOS in under 10 minutes.

## Prerequisites

- macOS with Xcode installed
- iPhone 12 or newer (for testing on device)
- 5-10 GB free storage (for models)

## 1. Setup (5 minutes)

```bash
cd mobile
./setup.sh
```

This will:
- Install npm dependencies
- Install CocoaPods
- Configure iOS project

## 2. Run the App

```bash
npm run ios
```

## 3. Load Your First Model

In your component:

```typescript
import { useMLModel } from '@/hooks';
import { LLAMA_3_2_1B_Q4 } from '@/ml/modelConfigs';

function MyApp() {
  const { loadModel, runInference, isModelLoaded, isDownloading, downloadProgress } =
    useMLModel(LLAMA_3_2_1B_Q4);

  return (
    <View>
      {!isModelLoaded && (
        <Button onPress={loadModel}>
          {isDownloading
            ? `Downloading: ${downloadProgress?.percentage.toFixed(0)}%`
            : 'Load Model'
          }
        </Button>
      )}

      {isModelLoaded && (
        <Button onPress={() => runInference('Hello!')}>
          Generate
        </Button>
      )}
    </View>
  );
}
```

## 4. Try the Example

The project includes a complete chat example:

```typescript
import { MLChatExample } from '@/components/MLChatExample';

function App() {
  return <MLChatExample />;
}
```

## Model Recommendations

### For Testing
**TinyLlama 1.1B** (670MB)
- Fastest download
- Works on all devices
- Good for initial testing

### For Production
**Llama 3.2 1B** (700MB)
- Best balance of size/quality
- Works great on iPhone 12+
- Recommended for most apps

**Llama 3.2 3B** (2GB)
- Higher quality
- Requires iPhone 13 Pro+ (6GB RAM)
- Best for premium experiences

## Common Tasks

### Check Device Capabilities

```typescript
import { useDeviceCapabilities } from '@/hooks';

const { capabilities } = useDeviceCapabilities();

console.log({
  device: capabilities?.device,
  ram: capabilities?.physicalMemoryGB,
  neuralEngine: capabilities?.neuralEngine,
});
```

### Download Progress Tracking

```typescript
const { isDownloading, downloadProgress } = useMLModel(config);

if (isDownloading) {
  console.log(`${downloadProgress?.percentage}% complete`);
}
```

### Manage Storage

```typescript
import { getDownloadedModels, deleteModel } from '@/utils/modelStorage';

// See what's downloaded
const models = await getDownloadedModels();

// Free up space
await deleteModel('model-id', 'gguf');
```

## Troubleshooting

### "Cannot find module 'llama.rn'"
```bash
cd ios && pod install && cd ..
```

### "Not enough storage"
Use a smaller model or delete unused models:
```typescript
await deleteModel('old-model-id', 'gguf');
```

### Slow inference
- Ensure you're on a physical device (not simulator)
- Use iPhone 12+ for best performance
- Close other apps to free up memory

## Next Steps

1. Read the [full mobile README](./README.md)
2. Check out [model configurations](./src/ml/modelConfigs.ts)
3. Learn about [model conversion](./docs/MODEL-CONVERSION.md)
4. Review [iOS setup details](./docs/iOS-SETUP.md)

## Key Files

- `src/ml/MLService.ts` - Core ML service
- `src/hooks/useMLModel.ts` - React hook for models
- `src/ml/modelConfigs.ts` - Pre-configured models
- `src/components/MLChatExample.tsx` - Example implementation
- `ios/MLKitBridge.swift` - Native Core ML bridge

## Performance Tips

1. **Use Q4 quantization** - Smallest with good quality
2. **Enable Metal** - Automatically uses GPU on iOS
3. **Reduce context length** - Faster inference
4. **Lower temperature** - More deterministic, faster

## Support

For issues or questions:
- Check the [main README](./README.md)
- Review [troubleshooting docs](./docs/iOS-SETUP.md#troubleshooting)
- See [model conversion guide](./docs/MODEL-CONVERSION.md)

Happy coding! 🚀
