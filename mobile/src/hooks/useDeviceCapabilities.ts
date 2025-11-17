/**
 * Custom React Hook for Device ML Capabilities
 */

import { useState, useEffect } from 'react';
import MLService from '../ml/MLService';
import type { DeviceCapabilities } from '../ml/types';

export interface UseDeviceCapabilitiesReturn {
  capabilities: DeviceCapabilities | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for checking device ML capabilities
 */
export function useDeviceCapabilities(): UseDeviceCapabilitiesReturn {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCapabilities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const caps = await MLService.getDeviceCapabilities();
      setCapabilities(caps);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get device capabilities');
      setError(error);
      console.error('Failed to get device capabilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCapabilities();
  }, []);

  return {
    capabilities,
    isLoading,
    error,
    refetch: fetchCapabilities,
  };
}
