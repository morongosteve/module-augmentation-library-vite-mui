/**
 * ML Model Types and Interfaces
 */

export enum ModelType {
  LLM = 'llm',
  VISION = 'vision',
  AUDIO = 'audio',
  MULTIMODAL = 'multimodal',
}

export enum ModelFormat {
  GGUF = 'gguf',
  CORE_ML = 'coreml',
  PYTORCH = 'pytorch',
}

export enum QuantizationType {
  Q4_0 = 'q4_0',
  Q4_1 = 'q4_1',
  Q5_0 = 'q5_0',
  Q5_1 = 'q5_1',
  Q8_0 = 'q8_0',
  F16 = 'f16',
  F32 = 'f32',
}

export interface ModelConfig {
  id: string;
  name: string;
  type: ModelType;
  format: ModelFormat;
  quantization?: QuantizationType;
  modelPath?: string;
  remoteUrl?: string;
  size: number; // in bytes
  requiredMemory: number; // in MB
  contextLength?: number;
  metadata?: Record<string, any>;
}

export interface ModelDownloadProgress {
  modelId: string;
  loaded: number;
  total: number;
  percentage: number;
}

export interface InferenceOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
  seed?: number;
}

export interface InferenceResult {
  text: string;
  tokens?: number;
  inferenceTime: number;
  tokensPerSecond?: number;
}

export interface DeviceCapabilities {
  neuralEngine: boolean;
  device: string;
  systemVersion: string;
  physicalMemoryGB: number;
  availableMemoryMB?: number;
}

export interface CoreMLModelInfo {
  author: string;
  license: string;
  description: string;
  version: string;
}
