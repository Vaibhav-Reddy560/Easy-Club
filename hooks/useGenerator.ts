import { useState, useCallback } from 'react';
import { GenerationStatus, GenerationState } from '@/lib/types';

export function useGenerator() {
  const [state, setState] = useState<GenerationState>({
    status: 'idle',
    progress: 0,
    error: null,
    result: null,
  });

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  const startGeneration = useCallback(() => {
    setState({
      status: 'generating',
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  const setSuccess = useCallback((result: any) => {
    setState({
      status: 'success',
      progress: 100,
      error: null,
      result,
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState({
      status: 'error',
      progress: 0,
      error,
      result: null,
    });
  }, []);

  return {
    ...state,
    reset,
    startGeneration,
    updateProgress,
    setSuccess,
    setError,
  };
}
