# Gradio ML Interface - Step-by-Step Guide

A web-based interface for testing and evaluating ML models before deploying to iOS.

## What is This?

This Gradio app provides an easy-to-use web interface for:
- **Testing Models**: Try different models before converting for iOS
- **Evaluating Quality**: Compare model outputs and performance
- **Determining Settings**: Find optimal temperature, tokens, etc.
- **Preparing for iOS**: Test models similar to how they'll run on iPhone

## Requirements

- Python 3.9 or later
- 8GB+ RAM (16GB+ recommended)
- GPU optional but recommended (NVIDIA CUDA or Apple Silicon)

## Step-by-Step Setup

### Step 1: Install Python Dependencies

```bash
cd gradio-app
pip install -r requirements.txt
```

**What this does:** Installs Gradio, PyTorch, Transformers, and all ML libraries needed.

**Time:** 5-10 minutes (depending on internet speed)

**Troubleshooting:**
- If you get CUDA errors and don't have an NVIDIA GPU, install CPU-only PyTorch:
  ```bash
  pip install torch --index-url https://download.pytorch.org/whl/cpu
  ```
- For Apple Silicon (M1/M2/M3), PyTorch will automatically use MPS

### Step 2: Run the Application

```bash
python app.py
```

**What this does:** Starts the Gradio web server.

**Expected output:**
```
Running on local URL:  http://127.0.0.1:7860
```

### Step 3: Open in Browser

1. Open your web browser
2. Go to: `http://127.0.0.1:7860`
3. You should see the ML Interface dashboard

### Step 4: Load Your First Model

**Using the Web Interface:**

1. **Go to "Model Management" tab**
2. **Select a model** from the dropdown:
   - Start with **TinyLlama 1.1B Chat** (smallest, fastest download)
   - Or **Llama 3.2 1B** for better quality
3. **Optional: Enable 4-bit quantization** (if you have CUDA GPU)
4. **Click "Load Model"**

**What happens:**
- Downloads model from Hugging Face (first time only)
- Loads model into memory
- Shows device information (CPU/CUDA/MPS)

**Time:** 
- TinyLlama: 2-5 minutes (first download)
- Llama 3.2 1B: 5-10 minutes
- Larger models: 10-20 minutes

**Troubleshooting:**
- **Out of memory**: Try smaller model or enable 4-bit quantization
- **Download fails**: Check internet connection
- **Model not loading**: Check the status output for error details

### Step 5: Test the Model

#### Option A: Chat Interface

1. **Go to "Chat" tab**
2. **Type a message** in the text box
3. **Click "Send"** or press Enter
4. **Wait for response** (5-30 seconds depending on model/hardware)

**Example prompts:**
```
Hello! How are you today?
What is the capital of France?
Write a short poem about coding.
Explain what machine learning is in simple terms.
```

#### Option B: Text Generation

1. **Go to "Text Generation" tab**
2. **Enter a prompt** in the large text box
3. **Adjust settings** (optional):
   - **Max Tokens**: How long the response can be
   - **Temperature**: 0.7 = balanced, 0.3 = focused, 1.5 = creative
   - **Top P**: Usually keep at 0.9
   - **Top K**: Usually keep at 50
4. **Click "Generate"**

**Example prompts:**
```
Write a Python function that calculates fibonacci numbers:

Complete this story: Once upon a time in a distant galaxy,

Create a recipe for chocolate chip cookies:
```

### Step 6: Evaluate the Model

**Questions to ask yourself:**

1. **Quality**: Are the responses good enough?
2. **Speed**: Is generation fast enough for your use case?
3. **Size**: Is the model small enough for iOS?
4. **Consistency**: Do you get good results with different prompts?

**Comparison table:**

| Model | Size | Speed | Quality | iOS Ready? |
|-------|------|-------|---------|------------|
| TinyLlama 1.1B | ~1GB | Fast | Basic | ✅ Yes |
| Llama 3.2 1B | ~2.5GB | Fast | Good | ✅ Yes |
| Llama 3.2 3B | ~6GB | Medium | Great | ✅ Yes (6GB+ devices) |
| Phi-3 Mini | ~7GB | Medium | Great | ✅ Yes (6GB+ devices) |

### Step 7: Experiment with Settings

**Temperature** (0.0 - 2.0):
- **0.3**: Very focused, deterministic (good for facts, code)
- **0.7**: Balanced (default, good for general use)
- **1.2**: Creative, varied (good for stories, brainstorming)

**Max Tokens** (32 - 1024):
- **64**: Short responses
- **256**: Medium responses (default)
- **512**: Long responses
- **1024**: Very long responses

**Try different combinations:**
```
Low temp (0.3) + Short tokens (64) = Quick, factual answers
High temp (1.2) + Long tokens (512) = Creative, detailed stories
```

### Step 8: Prepare Model for iOS

Once you've found a model you like:

#### For GGUF Format (llama.rn)

1. **Find the GGUF version** on Hugging Face:
   - Search for: `{model-name} GGUF`
   - Look for Q4_K_M quantization (best balance)

2. **Add to model configs**:
   ```typescript
   // mobile/src/ml/modelConfigs.ts
   export const MY_MODEL: ModelConfig = {
     id: 'my-model-q4',
     name: 'My Model (Q4)',
     type: ModelType.LLM,
     format: ModelFormat.GGUF,
     remoteUrl: 'https://huggingface.co/.../model.gguf',
     size: 700_000_000,
     requiredMemory: 1024,
     contextLength: 2048,
   };
   ```

3. **Use in React Native**:
   ```typescript
   import { useMLModel } from '@/hooks';
   import { MY_MODEL } from '@/ml/modelConfigs';
   
   const { loadModel, runInference } = useMLModel(MY_MODEL);
   ```

#### For Core ML Format (iOS native)

1. **Install conversion tools**:
   ```bash
   pip install coremltools
   ```

2. **Convert the model** (see [Model Conversion Guide](../mobile/docs/MODEL-CONVERSION.md))

3. **Add to iOS project** via Xcode

## Common Use Cases

### Use Case 1: Finding the Right Model

**Goal**: Determine which model to use for iOS app

**Steps**:
1. Load TinyLlama (baseline)
2. Test with typical user prompts
3. Note quality and speed
4. Load Llama 3.2 1B
5. Compare quality vs. size
6. Load Llama 3.2 3B if you have 6GB+ devices
7. Make final decision

### Use Case 2: Optimizing Settings

**Goal**: Find best temperature/token settings

**Steps**:
1. Load your chosen model
2. Use same prompt with different temperatures:
   - 0.3, 0.7, 1.0, 1.5
3. Compare outputs
4. Try different max tokens: 64, 128, 256
5. Document best settings for your use case

### Use Case 3: Quality Testing

**Goal**: Ensure model is good enough before iOS deployment

**Steps**:
1. Prepare 10-20 test prompts covering your use cases
2. Load model
3. Test each prompt
4. Rate quality (1-5 stars)
5. Calculate average
6. Decide if quality meets requirements

## Advanced Features

### Using 4-bit Quantization

**When to use**: 
- Limited GPU memory
- Want to test larger models
- Simulating iOS performance

**How to enable**:
1. Requires NVIDIA GPU with CUDA
2. Check "Use 4-bit Quantization" before loading
3. Model will use ~75% less memory

**Tradeoff**: Slightly lower quality for much smaller size

### Custom Models

**To test your own fine-tuned model**:

1. Upload to Hugging Face
2. Get model ID (e.g., `username/model-name`)
3. Modify `src/ml_interface.py`:
   ```python
   # Add to list_available_models()
   {
       "name": "My Custom Model",
       "model_id": "username/my-model",
       "size": "~XGB",
       "description": "My fine-tuned model",
       "recommended_for": "Specific task",
   }
   ```

### Comparing Multiple Models

**Strategy**:
1. Create a Google Sheet with columns:
   - Model Name
   - Prompt
   - Response
   - Quality (1-5)
   - Speed (seconds)
   - Notes
2. Test same prompts across models
3. Compare results
4. Make data-driven decision

## Troubleshooting

### Problem: Out of Memory

**Solutions**:
1. Use smaller model (TinyLlama)
2. Enable 4-bit quantization
3. Reduce max tokens
4. Close other applications
5. Restart Python and try again

### Problem: Slow Generation

**Causes**:
- Running on CPU instead of GPU
- Model too large for hardware
- Other applications using resources

**Solutions**:
1. Check device info - should use CUDA/MPS if available
2. Use smaller model
3. Close other applications
4. Reduce max tokens

### Problem: Poor Quality Responses

**Solutions**:
1. Try different model (larger = better quality)
2. Adjust temperature (lower = more focused)
3. Improve prompts (be more specific)
4. Increase max tokens if responses are cut off

### Problem: Model Won't Load

**Check**:
1. Internet connection (for first download)
2. Disk space (models are large)
3. Error message in status output
4. Python/package versions

## Next Steps

After testing models in Gradio:

1. **Document your findings**:
   - Which model works best
   - Optimal settings
   - Expected performance

2. **Convert for iOS**:
   - Follow [Model Conversion Guide](../mobile/docs/MODEL-CONVERSION.md)
   - Or find GGUF version for llama.rn

3. **Deploy to React Native**:
   - Add model to configs
   - Test on iOS device
   - Monitor performance

4. **Iterate**:
   - Gather user feedback
   - A/B test different models
   - Optimize based on real usage

## File Structure

```
gradio-app/
├── app.py                 # Main Gradio application
├── src/
│   └── ml_interface.py    # ML operations
├── models/                # Downloaded models (created automatically)
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Tips & Best Practices

1. **Start small**: Always test with TinyLlama first
2. **Document everything**: Keep notes on what works
3. **Use consistent prompts**: Compare apples to apples
4. **Monitor resources**: Watch RAM/GPU usage
5. **Test edge cases**: Try unusual inputs
6. **Plan for iOS constraints**: Remember mobile has less RAM
7. **Save good outputs**: Keep examples for documentation

## Resources

- [Hugging Face Models](https://huggingface.co/models)
- [Gradio Documentation](https://gradio.app/docs/)
- [Model Conversion Guide](../mobile/docs/MODEL-CONVERSION.md)
- [iOS Setup Guide](../mobile/docs/iOS-SETUP.md)
- [Mobile App README](../mobile/README.md)

## FAQ

**Q: Can I use this on Windows?**
A: Yes! Everything works on Windows, Mac, and Linux.

**Q: Do I need a GPU?**
A: No, but it's much faster with one. CPU works for smaller models.

**Q: How much disk space do I need?**
A: At least 10GB free for models and cache.

**Q: Can I run multiple models at once?**
A: No, you must unload one before loading another.

**Q: Will this work on iPhone?**
A: This is for desktop testing. Use the mobile app for iPhone.

**Q: Can I use this commercially?**
A: Check each model's license. Most are open source but have restrictions.

## Support

For issues:
1. Check this guide
2. Review error messages
3. See [Model Conversion Guide](../mobile/docs/MODEL-CONVERSION.md)
4. Check model licenses and requirements

Happy testing! 🚀
