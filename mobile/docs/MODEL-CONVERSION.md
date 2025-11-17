# Model Conversion Guide

Guide for converting models to formats optimized for iOS deployment.

## Overview

This guide covers converting models to:
- **Core ML** (.mlmodel, .mlpackage) - Apple's native format
- **GGUF** - Quantized format for LLMs

## Core ML Conversion

### Prerequisites

```bash
pip install coremltools torch transformers
```

### Converting PyTorch Models

#### Example: Converting a Hugging Face Model

```python
import torch
import coremltools as ct
from transformers import AutoModel, AutoTokenizer

# Load model from Hugging Face
model_name = "distilbert-base-uncased"
model = AutoModel.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Set to evaluation mode
model.eval()

# Create example input
example_text = "This is a sample input"
inputs = tokenizer(example_text, return_tensors="pt")

# Trace the model
traced_model = torch.jit.trace(model, (inputs["input_ids"], inputs["attention_mask"]))

# Convert to Core ML
coreml_model = ct.convert(
    traced_model,
    inputs=[
        ct.TensorType(name="input_ids", shape=(1, 512), dtype=np.int32),
        ct.TensorType(name="attention_mask", shape=(1, 512), dtype=np.int32),
    ],
    minimum_deployment_target=ct.target.iOS14,
)

# Add metadata
coreml_model.author = "Your Name"
coreml_model.license = "MIT"
coreml_model.short_description = "Converted from Hugging Face"
coreml_model.version = "1.0"

# Save
coreml_model.save("DistilBERT.mlpackage")
```

#### Example: Converting Vision Model

```python
import torch
import torchvision
import coremltools as ct

# Load a vision model
model = torchvision.models.mobilenet_v3_small(pretrained=True)
model.eval()

# Create example input (image tensor)
example_input = torch.rand(1, 3, 224, 224)

# Trace model
traced_model = torch.jit.trace(model, example_input)

# Convert with image input
coreml_model = ct.convert(
    traced_model,
    inputs=[ct.ImageType(name="image", shape=(1, 3, 224, 224))],
    minimum_deployment_target=ct.target.iOS14,
    compute_units=ct.ComputeUnit.ALL,  # Use Neural Engine
)

# Save
coreml_model.save("MobileNetV3.mlpackage")
```

### Optimization Techniques

#### 1. Quantization

Reduce model size with minimal accuracy loss:

```python
# 8-bit quantization
coreml_model = ct.convert(
    traced_model,
    inputs=[ct.TensorType(shape=input_shape)],
    minimum_deployment_target=ct.target.iOS14,
    compute_precision=ct.precision.FLOAT16,  # Use FP16
)

# Weight compression
import coremltools.optimize.coreml as cto

op_config = cto.OpPalettizerConfig(mode="kmeans", nbits=4)
config = cto.OptimizationConfig(global_config=op_config)

compressed_model = cto.palettize_weights(coreml_model, config)
compressed_model.save("model_compressed.mlpackage")
```

#### 2. Neural Engine Optimization

```python
# Ensure model uses Neural Engine
coreml_model = ct.convert(
    traced_model,
    inputs=[ct.TensorType(shape=input_shape)],
    compute_units=ct.ComputeUnit.ALL,  # Try all compute units
    minimum_deployment_target=ct.target.iOS16,  # Latest features
)
```

### Using Apple's Pre-converted Models

Many models are already available in Core ML format:

```bash
# Install transformers
pip install huggingface-hub

# Download pre-converted model
from huggingface_hub import snapshot_download

model_path = snapshot_download(
    repo_id="apple/coreml-stable-diffusion-2-1-base",
    allow_patterns=["*.mlpackage/*"],
)
```

Popular Apple models on Hugging Face:
- `apple/coreml-stable-diffusion-2-1-base`
- `apple/coreml-whisper-small`
- `apple/ml-fastvit`

## GGUF Conversion (LLMs)

### Using llama.cpp

#### Prerequisites

```bash
# Clone llama.cpp
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# Install Python dependencies
pip install -r requirements.txt
```

#### Convert Hugging Face Model to GGUF

```bash
# Download model from Hugging Face
git lfs install
git clone https://huggingface.co/meta-llama/Llama-2-7b-chat-hf

# Convert to GGUF
python convert.py ./Llama-2-7b-chat-hf/ \
  --outfile llama-2-7b-chat.gguf \
  --outtype f16

# Quantize to Q4
./quantize llama-2-7b-chat.gguf \
  llama-2-7b-chat-q4_0.gguf \
  q4_0
```

#### Quantization Options

| Format | Size Reduction | Quality | Use Case |
|--------|---------------|---------|----------|
| Q4_0   | ~75%         | Good    | Mobile (recommended) |
| Q4_1   | ~75%         | Better  | Mobile with more memory |
| Q5_0   | ~67%         | Very Good | High-end mobile |
| Q5_1   | ~67%         | Excellent | Tablets/High memory |
| Q8_0   | ~50%         | Near Original | Testing |
| F16    | ~50%         | Original | Development |

### Automated Quantization Script

```python
import subprocess
import os

def quantize_model(input_path, output_dir, formats=['q4_0', 'q4_1', 'q5_0']):
    """Quantize model to multiple formats"""

    base_name = os.path.splitext(os.path.basename(input_path))[0]

    for fmt in formats:
        output_path = os.path.join(output_dir, f"{base_name}-{fmt}.gguf")

        print(f"Quantizing to {fmt}...")
        subprocess.run([
            './llama.cpp/quantize',
            input_path,
            output_path,
            fmt
        ])

        # Get file size
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"  Created: {output_path} ({size_mb:.1f} MB)")

# Usage
quantize_model(
    'llama-2-7b-chat.gguf',
    './quantized_models',
    formats=['q4_0', 'q5_0', 'q8_0']
)
```

## Model Size Guidelines

### iPhone Models and Memory

| Device | RAM | Recommended Model Size |
|--------|-----|------------------------|
| iPhone 12/13 | 4GB | < 1GB (Q4 1B models) |
| iPhone 12/13 Pro | 6GB | < 2GB (Q4 3B models) |
| iPhone 14 Pro | 6GB | < 2.5GB (Q4 3B models) |
| iPhone 15 Pro | 8GB | < 3GB (Q5 7B models) |

### Size Optimization Checklist

- [ ] Use Q4 quantization for mobile
- [ ] Enable Core ML palettization
- [ ] Use FP16 instead of FP32
- [ ] Compress model with coremltools
- [ ] Test on target device memory
- [ ] Consider on-demand downloading

## Testing Converted Models

### Test Core ML Model

```python
import coremltools as ct

# Load model
model = ct.models.MLModel("MyModel.mlpackage")

# Test prediction
prediction = model.predict({"input": example_input})
print(prediction)

# Check model info
spec = model.get_spec()
print(f"Inputs: {spec.description.input}")
print(f"Outputs: {spec.description.output}")
```

### Test GGUF Model

```bash
# Test with llama.cpp
./llama.cpp/main \
  -m llama-2-7b-chat-q4_0.gguf \
  -p "Hello, how are you?" \
  -n 50
```

### Test in React Native

```typescript
import MLService from './src/ml/MLService';

const testModel: ModelConfig = {
  id: 'test-model',
  name: 'Test Model',
  type: ModelType.LLM,
  format: ModelFormat.GGUF,
  modelPath: '/path/to/model.gguf',
  size: 1_000_000_000,
  requiredMemory: 2048,
  contextLength: 2048,
};

await MLService.loadModel(testModel);

const result = await MLService.runInference(
  'test-model',
  'Test prompt',
  { maxTokens: 50 }
);

console.log('Result:', result.text);
console.log('Speed:', result.tokensPerSecond, 'tokens/sec');
```

## Hosting Converted Models

### Option 1: Hugging Face

```bash
# Install Hugging Face CLI
pip install huggingface-hub

# Login
huggingface-cli login

# Upload model
huggingface-cli upload username/model-name ./model.gguf
```

### Option 2: GitHub Releases

```bash
# Create release with model
gh release create v1.0.0 \
  --title "Model v1.0.0" \
  --notes "Quantized model for iOS" \
  model-q4_0.gguf
```

### Option 3: CDN/Cloud Storage

- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- Cloudflare R2

## Troubleshooting

### Conversion Fails

- Check PyTorch/TensorFlow version compatibility
- Ensure model is in evaluation mode
- Verify input shapes match
- Try simpler conversion first (FP32)

### Model Too Large

- Use more aggressive quantization (Q4 → Q3)
- Apply Core ML compression
- Split into multiple models
- Use on-demand loading

### Poor Performance

- Verify Neural Engine is being used
- Test different quantization levels
- Check model complexity
- Profile with Xcode Instruments

## Resources

- [Core ML Tools](https://apple.github.io/coremltools/)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)
- [GGUF Specification](https://github.com/ggerganov/ggml/blob/master/docs/gguf.md)
- [Hugging Face Model Hub](https://huggingface.co/models)
- [Apple ML Models](https://huggingface.co/apple)

## Next Steps

1. Convert your first model following the examples
2. Test on iOS device using the MLService
3. Optimize based on performance metrics
4. Deploy to production
