/**
 * Custom React Hook for ML Model Management
 */

import { useState, useEffect, useCallback } from 'react';
import MLService from '../ml/MLService';
import type {
  ModelConfig,
  InferenceOptions,
  InferenceResult,
  ModelDownloadProgress,
} from '../ml/types';

export interface UseMLModelReturn {
  isLoading: boolean;
  isDownloading: boolean;
  downloadProgress: ModelDownloadProgress | null;
  error: Error | null;
  loadModel: () => Promise<void>;
  runInference: (prompt: string, options?: InferenceOptions) => Promise<InferenceResult | null>;
  unloadModel: () => Promise<void>;
  isModelLoaded: boolean;
}

/**
 * Hook for managing ML models
 */
export function useMLModel(config: ModelConfig): UseMLModelReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<ModelDownloadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    // Check if model is already loaded
    setIsModelLoaded(MLService.isModelLoaded(config.id));
  }, [config.id]);

  const loadModel = useCallback(async () => {
    if (MLService.isModelLoaded(config.id)) {
      console.log(`Model ${config.id} is already loaded`);
      setIsModelLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if we need to download
      if (config.remoteUrl && !config.modelPath) {
        setIsDownloading(true);

        await MLService.downloadModel(config, (progress) => {
          setDownloadProgress(progress);
        });

        setIsDownloading(false);
        setDownloadProgress(null);
      }

      await MLService.loadModel(config);
      setIsModelLoaded(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load model');
      setError(error);
      setIsModelLoaded(false);
      console.error('Failed to load model:', error);
    } finally {
      setIsLoading(false);
      setIsDownloading(false);
    }
  }, [config]);

  const runInference = useCallback(
    async (prompt: string, options?: InferenceOptions): Promise<InferenceResult | null> => {
      if (!isModelLoaded) {
        const error = new Error('Model is not loaded. Call loadModel() first.');
        setError(error);
        return null;
      }

      setError(null);

      try {
        const result = await MLService.runInference(config.id, prompt, options);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Inference failed');
        setError(error);
        console.error('Inference failed:', error);
        return null;
      }
    },
    [config.id, isModelLoaded]
  );

  const unloadModel = useCallback(async () => {
    try {
      await MLService.unloadModel(config.id);
      setIsModelLoaded(false);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to unload model');
      setError(error);
      console.error('Failed to unload model:', error);
    }
  }, [config.id]);

  return {
    isLoading,
    isDownloading,
    downloadProgress,
    error,
    loadModel,
    runInference,
    unloadModel,
    isModelLoaded,
  };
}
