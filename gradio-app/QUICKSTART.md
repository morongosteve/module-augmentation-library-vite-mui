# Gradio ML Interface - Quick Start (5 Minutes)

Get up and running in 5 minutes to test ML models before iOS deployment.

## Prerequisites

- Python 3.9+
- 8GB+ RAM
- Internet connection

## 1. Install (2 minutes)

```bash
cd gradio-app
pip install -r requirements.txt
```

**First time?** This will download ~2GB of packages. Grab a coffee! ☕

## 2. Run (30 seconds)

```bash
python app.py
```

**Expected output:**
```
Running on local URL:  http://127.0.0.1:7860
```

## 3. Open Browser (10 seconds)

Go to: **http://127.0.0.1:7860**

## 4. Load a Model (2 minutes)

1. Go to **"Model Management"** tab
2. Select: **TinyLlama 1.1B Chat** (smallest, fastest)
3. Click: **"Load Model"**
4. Wait for: ✅ Model loaded successfully

## 5. Test It! (30 seconds)

### Quick Chat

1. Go to **"Chat"** tab
2. Type: `Hello! Tell me a joke.`
3. Click: **"Send"**
4. Wait for response

### Quick Generation

1. Go to **"Text Generation"** tab
2. Type: `Write a haiku about coding:`
3. Click: **"Generate"**

## Done! 🎉

You now have a working ML testing environment.

## Next Steps

### Test More Models

- **Llama 3.2 1B** - Better quality, still fast
- **Phi-3 Mini** - Microsoft's efficient model
- **Llama 3.2 3B** - Best quality (needs more RAM)

### Optimize Settings

- **Temperature 0.7** = Balanced (default)
- **Temperature 0.3** = Focused answers
- **Temperature 1.2** = Creative responses

### Prepare for iOS

1. Pick your favorite model
2. Find GGUF version on Hugging Face
3. Add to `mobile/src/ml/modelConfigs.ts`
4. Deploy to React Native app

## Common Issues

### "Out of memory"
→ Use **TinyLlama** or close other apps

### "Download fails"
→ Check internet connection, try again

### "Slow generation"
→ Normal on CPU, use smaller model or GPU

## Need Help?

See the [full README](./README.md) for detailed guide.

---

**Pro tip:** Start with TinyLlama, test your prompts, then upgrade to larger models if needed. Smaller ≠ worse for many use cases!
