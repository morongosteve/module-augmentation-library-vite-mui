/**
 * ML Service - Main service for managing ML models
 */

import { NativeModules, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { initLlama, loadLlamaModel } from 'llama.rn';
import type {
  ModelConfig,
  ModelDownloadProgress,
  InferenceOptions,
  InferenceResult,
  DeviceCapabilities,
  CoreMLModelInfo,
  ModelFormat,
} from './types';

const { MLKitBridge } = NativeModules;

class MLService {
  private models: Map<string, any> = new Map();
  private downloadListeners: Map<string, ((progress: ModelDownloadProgress) => void)[]> = new Map();

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the ML service
   */
  private async initialize() {
    try {
      await initLlama();
      console.log('ML Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ML Service:', error);
    }
  }

  /**
   * Get device capabilities for ML
   */
  async getDeviceCapabilities(): Promise<DeviceCapabilities> {
    if (Platform.OS === 'ios') {
      try {
        return await MLKitBridge.getDeviceCapabilities();
      } catch (error) {
        console.error('Failed to get device capabilities:', error);
        throw error;
      }
    }

    // Android fallback
    return {
      neuralEngine: false,
      device: 'Android',
      systemVersion: Platform.Version.toString(),
      physicalMemoryGB: 0,
    };
  }

  /**
   * Download a model from a remote URL
   */
  async downloadModel(
    config: ModelConfig,
    onProgress?: (progress: ModelDownloadProgress) => void
  ): Promise<string> {
    const fileName = `${config.id}.${config.format}`;
    const downloadDest = `${RNFS.DocumentDirectoryPath}/models/${fileName}`;

    try {
      // Create models directory if it doesn't exist
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/models`);

      // Check if model already exists
      const exists = await RNFS.exists(downloadDest);
      if (exists) {
        console.log(`Model ${config.id} already exists at ${downloadDest}`);
        return downloadDest;
      }

      if (!config.remoteUrl) {
        throw new Error('Remote URL is required for downloading model');
      }

      // Download with progress tracking
      const download = RNFS.downloadFile({
        fromUrl: config.remoteUrl,
        toFile: downloadDest,
        progress: (res) => {
          const progress: ModelDownloadProgress = {
            modelId: config.id,
            loaded: res.bytesWritten,
            total: res.contentLength,
            percentage: (res.bytesWritten / res.contentLength) * 100,
          };

          if (onProgress) {
            onProgress(progress);
          }

          // Notify all registered listeners
          const listeners = this.downloadListeners.get(config.id) || [];
          listeners.forEach((listener) => listener(progress));
        },
      });

      const result = await download.promise;

      if (result.statusCode === 200) {
        console.log(`Model ${config.id} downloaded successfully to ${downloadDest}`);
        return downloadDest;
      } else {
        throw new Error(`Download failed with status code ${result.statusCode}`);
      }
    } catch (error) {
      console.error(`Failed to download model ${config.id}:`, error);
      throw error;
    }
  }

  /**
   * Load a model for inference
   */
  async loadModel(config: ModelConfig): Promise<void> {
    try {
      let modelPath = config.modelPath;

      // Download if not present locally
      if (!modelPath && config.remoteUrl) {
        modelPath = await this.downloadModel(config);
      }

      if (!modelPath) {
        throw new Error('Model path is required');
      }

      if (config.format === ModelFormat.GGUF) {
        // Load GGUF model with llama.rn
        const context = await loadLlamaModel({
          model: modelPath,
          use_mlock: true,
          n_ctx: config.contextLength || 2048,
          n_gpu_layers: Platform.OS === 'ios' ? 1 : 0, // Use Metal on iOS
        });

        this.models.set(config.id, {
          type: 'llama',
          context,
          config,
        });

        console.log(`GGUF model ${config.id} loaded successfully`);
      } else if (config.format === ModelFormat.CORE_ML && Platform.OS === 'ios') {
        // Load Core ML model
        await MLKitBridge.loadCoreMLModel(modelPath);

        this.models.set(config.id, {
          type: 'coreml',
          path: modelPath,
          config,
        });

        console.log(`Core ML model ${config.id} loaded successfully`);
      } else {
        throw new Error(`Unsupported model format: ${config.format}`);
      }
    } catch (error) {
      console.error(`Failed to load model ${config.id}:`, error);
      throw error;
    }
  }

  /**
   * Run inference on a loaded model
   */
  async runInference(
    modelId: string,
    prompt: string,
    options: InferenceOptions = {}
  ): Promise<InferenceResult> {
    const model = this.models.get(modelId);

    if (!model) {
      throw new Error(`Model ${modelId} is not loaded`);
    }

    const startTime = Date.now();

    try {
      if (model.type === 'llama') {
        const result = await model.context.completion(
          {
            prompt,
            n_predict: options.maxTokens || 256,
            temperature: options.temperature || 0.7,
            top_p: options.topP || 0.9,
            top_k: options.topK || 40,
            seed: options.seed || -1,
            stop: options.stopSequences || [],
          },
          (data: any) => {
            // Streaming callback (optional)
            console.log('Token:', data.token);
          }
        );

        const inferenceTime = Date.now() - startTime;

        return {
          text: result.text,
          tokens: result.tokens_predicted,
          inferenceTime,
          tokensPerSecond: result.tokens_predicted / (inferenceTime / 1000),
        };
      } else {
        throw new Error(`Inference not implemented for model type: ${model.type}`);
      }
    } catch (error) {
      console.error(`Inference failed for model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Get Core ML model info (iOS only)
   */
  async getCoreMLModelInfo(modelPath: string): Promise<CoreMLModelInfo> {
    if (Platform.OS !== 'ios') {
      throw new Error('Core ML is only available on iOS');
    }

    try {
      return await MLKitBridge.getModelInfo(modelPath);
    } catch (error) {
      console.error('Failed to get Core ML model info:', error);
      throw error;
    }
  }

  /**
   * Unload a model from memory
   */
  async unloadModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId);

    if (!model) {
      console.warn(`Model ${modelId} is not loaded`);
      return;
    }

    try {
      if (model.type === 'llama' && model.context) {
        await model.context.release();
      }

      this.models.delete(modelId);
      console.log(`Model ${modelId} unloaded successfully`);
    } catch (error) {
      console.error(`Failed to unload model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Check if a model is loaded
   */
  isModelLoaded(modelId: string): boolean {
    return this.models.has(modelId);
  }

  /**
   * Get all loaded models
   */
  getLoadedModels(): string[] {
    return Array.from(this.models.keys());
  }

  /**
   * Register a download progress listener
   */
  onDownloadProgress(modelId: string, callback: (progress: ModelDownloadProgress) => void) {
    const listeners = this.downloadListeners.get(modelId) || [];
    listeners.push(callback);
    this.downloadListeners.set(modelId, listeners);

    // Return unsubscribe function
    return () => {
      const updatedListeners = this.downloadListeners.get(modelId) || [];
      const index = updatedListeners.indexOf(callback);
      if (index > -1) {
        updatedListeners.splice(index, 1);
        this.downloadListeners.set(modelId, updatedListeners);
      }
    };
  }
}

export default new MLService();
