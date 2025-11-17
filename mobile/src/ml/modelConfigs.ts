/**
 * Pre-configured ML Models
 * Popular models ready to use
 */

import { ModelConfig, ModelType, ModelFormat, QuantizationType } from './types';

/**
 * Llama 3.2 1B Instruct - Quantized for mobile
 * Recommended for: General chat, Q&A, lightweight applications
 */
export const LLAMA_3_2_1B_Q4: ModelConfig = {
  id: 'llama-3.2-1b-instruct-q4',
  name: 'Llama 3.2 1B Instruct (Q4)',
  type: ModelType.LLM,
  format: ModelFormat.GGUF,
  quantization: QuantizationType.Q4_0,
  remoteUrl: 'https://huggingface.co/ggml-org/Llama-3.2-1B-Instruct-Q4_K_M-GGUF/resolve/main/llama-3.2-1b-instruct-q4_k_m.gguf',
  size: 700_000_000, // ~700MB
  requiredMemory: 1024, // 1GB
  contextLength: 8192,
  metadata: {
    description: 'Meta Llama 3.2 1B Instruct optimized for mobile devices',
    license: 'Llama 3.2 Community License',
    supportedLanguages: ['en', 'de', 'fr', 'it', 'pt', 'hi', 'es', 'th'],
  },
};

/**
 * Llama 3.2 3B Instruct - Quantized for mobile
 * Recommended for: Advanced chat, reasoning, code generation
 */
export const LLAMA_3_2_3B_Q4: ModelConfig = {
  id: 'llama-3.2-3b-instruct-q4',
  name: 'Llama 3.2 3B Instruct (Q4)',
  type: ModelType.LLM,
  format: ModelFormat.GGUF,
  quantization: QuantizationType.Q4_0,
  remoteUrl: 'https://huggingface.co/ggml-org/Llama-3.2-3B-Instruct-Q4_K_M-GGUF/resolve/main/llama-3.2-3b-instruct-q4_k_m.gguf',
  size: 2_000_000_000, // ~2GB
  requiredMemory: 3072, // 3GB
  contextLength: 8192,
  metadata: {
    description: 'Meta Llama 3.2 3B Instruct with enhanced reasoning capabilities',
    license: 'Llama 3.2 Community License',
    supportedLanguages: ['en', 'de', 'fr', 'it', 'pt', 'hi', 'es', 'th'],
  },
};

/**
 * Phi-3 Mini - Microsoft's efficient small model
 * Recommended for: Efficient chat, low-resource devices
 */
export const PHI_3_MINI_Q4: ModelConfig = {
  id: 'phi-3-mini-q4',
  name: 'Phi-3 Mini 4K Instruct (Q4)',
  type: ModelType.LLM,
  format: ModelFormat.GGUF,
  quantization: QuantizationType.Q4_0,
  remoteUrl: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct-gguf/resolve/main/Phi-3-mini-4k-instruct-q4.gguf',
  size: 2_300_000_000, // ~2.3GB
  requiredMemory: 3072, // 3GB
  contextLength: 4096,
  metadata: {
    description: 'Microsoft Phi-3 Mini optimized for mobile and edge devices',
    license: 'MIT',
  },
};

/**
 * Gemma 2B - Google's compact model
 * Recommended for: Efficient inference, privacy-focused apps
 */
export const GEMMA_2B_Q4: ModelConfig = {
  id: 'gemma-2b-q4',
  name: 'Gemma 2B Instruct (Q4)',
  type: ModelType.LLM,
  format: ModelFormat.GGUF,
  quantization: QuantizationType.Q4_0,
  remoteUrl: 'https://huggingface.co/google/gemma-2b-it-GGUF/resolve/main/gemma-2b-it-q4_k_m.gguf',
  size: 1_600_000_000, // ~1.6GB
  requiredMemory: 2048, // 2GB
  contextLength: 8192,
  metadata: {
    description: 'Google Gemma 2B instruction-tuned model',
    license: 'Gemma Terms of Use',
  },
};

/**
 * TinyLlama - Ultra-compact model
 * Recommended for: Extremely resource-constrained devices, testing
 */
export const TINYLLAMA_1_1B_Q4: ModelConfig = {
  id: 'tinyllama-1.1b-q4',
  name: 'TinyLlama 1.1B Chat (Q4)',
  type: ModelType.LLM,
  format: ModelFormat.GGUF,
  quantization: QuantizationType.Q4_0,
  remoteUrl: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
  size: 670_000_000, // ~670MB
  requiredMemory: 1024, // 1GB
  contextLength: 2048,
  metadata: {
    description: 'Ultra-compact LLM for testing and resource-constrained scenarios',
    license: 'Apache 2.0',
  },
};

/**
 * Core ML Stable Diffusion (iOS only)
 * Recommended for: Image generation on iOS
 */
export const STABLE_DIFFUSION_CORE_ML: ModelConfig = {
  id: 'stable-diffusion-2-1-coreml',
  name: 'Stable Diffusion 2.1 (Core ML)',
  type: ModelType.VISION,
  format: ModelFormat.CORE_ML,
  remoteUrl: 'https://huggingface.co/apple/coreml-stable-diffusion-2-1-base/resolve/main/stable-diffusion-2-1-base.mlpackage.zip',
  size: 2_500_000_000, // ~2.5GB
  requiredMemory: 4096, // 4GB
  metadata: {
    description: 'Stable Diffusion 2.1 optimized for Apple Neural Engine',
    license: 'CreativeML Open RAIL++-M License',
    platform: 'iOS only',
  },
};

/**
 * All available model configurations
 */
export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  'llama-3.2-1b-q4': LLAMA_3_2_1B_Q4,
  'llama-3.2-3b-q4': LLAMA_3_2_3B_Q4,
  'phi-3-mini-q4': PHI_3_MINI_Q4,
  'gemma-2b-q4': GEMMA_2B_Q4,
  'tinyllama-1.1b-q4': TINYLLAMA_1_1B_Q4,
  'stable-diffusion-coreml': STABLE_DIFFUSION_CORE_ML,
};

/**
 * Get recommended model based on device capabilities
 */
export function getRecommendedModel(memoryGB: number): ModelConfig {
  if (memoryGB >= 6) {
    return LLAMA_3_2_3B_Q4; // Best quality for high-end devices
  } else if (memoryGB >= 4) {
    return PHI_3_MINI_Q4; // Good balance
  } else if (memoryGB >= 3) {
    return LLAMA_3_2_1B_Q4; // Lightweight but capable
  } else {
    return TINYLLAMA_1_1B_Q4; // Minimal for low-end devices
  }
}
