/**
 * Model Storage Utilities
 * Helpers for managing model files on device
 */

import RNFS from 'react-native-fs';
import type { ModelConfig } from '../ml/types';

const MODELS_DIR = `${RNFS.DocumentDirectoryPath}/models`;

/**
 * Initialize models directory
 */
export async function initializeModelsDirectory(): Promise<void> {
  try {
    const exists = await RNFS.exists(MODELS_DIR);
    if (!exists) {
      await RNFS.mkdir(MODELS_DIR);
      console.log('Models directory created:', MODELS_DIR);
    }
  } catch (error) {
    console.error('Failed to initialize models directory:', error);
    throw error;
  }
}

/**
 * Get the local path for a model
 */
export function getModelPath(modelId: string, format: string): string {
  return `${MODELS_DIR}/${modelId}.${format}`;
}

/**
 * Check if a model exists locally
 */
export async function modelExists(modelId: string, format: string): Promise<boolean> {
  try {
    const path = getModelPath(modelId, format);
    return await RNFS.exists(path);
  } catch (error) {
    console.error('Failed to check model existence:', error);
    return false;
  }
}

/**
 * Get model file size
 */
export async function getModelSize(modelId: string, format: string): Promise<number> {
  try {
    const path = getModelPath(modelId, format);
    const stat = await RNFS.stat(path);
    return parseInt(stat.size, 10);
  } catch (error) {
    console.error('Failed to get model size:', error);
    return 0;
  }
}

/**
 * Delete a model from storage
 */
export async function deleteModel(modelId: string, format: string): Promise<void> {
  try {
    const path = getModelPath(modelId, format);
    const exists = await RNFS.exists(path);

    if (exists) {
      await RNFS.unlink(path);
      console.log(`Model ${modelId} deleted successfully`);
    }
  } catch (error) {
    console.error(`Failed to delete model ${modelId}:`, error);
    throw error;
  }
}

/**
 * Get all downloaded models
 */
export async function getDownloadedModels(): Promise<string[]> {
  try {
    await initializeModelsDirectory();
    const files = await RNFS.readDir(MODELS_DIR);
    return files.map((file) => file.name);
  } catch (error) {
    console.error('Failed to get downloaded models:', error);
    return [];
  }
}

/**
 * Get available storage space
 */
export async function getAvailableStorage(): Promise<number> {
  try {
    const freeSpace = await RNFS.getFSInfo();
    return freeSpace.freeSpace;
  } catch (error) {
    console.error('Failed to get available storage:', error);
    return 0;
  }
}

/**
 * Check if there's enough space to download a model
 */
export async function hasEnoughSpace(modelSize: number): Promise<boolean> {
  try {
    const availableSpace = await getAvailableStorage();
    // Require 1.5x the model size to be safe
    return availableSpace > modelSize * 1.5;
  } catch (error) {
    console.error('Failed to check storage space:', error);
    return false;
  }
}

/**
 * Clear all models from storage
 */
export async function clearAllModels(): Promise<void> {
  try {
    const exists = await RNFS.exists(MODELS_DIR);
    if (exists) {
      await RNFS.unlink(MODELS_DIR);
      await RNFS.mkdir(MODELS_DIR);
      console.log('All models cleared successfully');
    }
  } catch (error) {
    console.error('Failed to clear all models:', error);
    throw error;
  }
}
