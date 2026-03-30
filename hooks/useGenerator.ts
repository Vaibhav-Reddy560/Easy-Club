import { useState, useCallback, useRef } from 'react';
import { GenerationStatus, GenerationState } from '@/lib/types';
import { useTasks } from '@/lib/TaskContext';

export function useGenerator(taskName?: string) {
  const { startTask, updateTaskProgress, finishTask } = useTasks();
  // Generate a stable unique ID for this instance's task lifecycle
  const taskIdRef = useRef(`task_${Math.random().toString(36).substr(2, 9)}`);

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
    if (taskName) {
      startTask(taskIdRef.current, taskName);
    }
    setState({
      status: 'generating',
      progress: 0,
      error: null,
      result: null,
    });
  }, [taskName, startTask]);

  const updateProgress = useCallback((progress: number) => {
    if (taskName) {
      updateTaskProgress(taskIdRef.current, progress);
    }
    setState(prev => ({ ...prev, progress }));
  }, [taskName, updateTaskProgress]);

  const setSuccess = useCallback((result: any) => {
    if (taskName) {
      finishTask(taskIdRef.current, true);
    }
    setState({
      status: 'success',
      progress: 100,
      error: null,
      result,
    });
  }, [taskName, finishTask]);

  const setError = useCallback((error: string) => {
    if (taskName) {
      finishTask(taskIdRef.current, false);
    }
    setState({
      status: 'error',
      progress: 0,
      error,
      result: null,
    });
  }, [taskName, finishTask]);

  return {
    ...state,
    reset,
    startGeneration,
    updateProgress,
    setSuccess,
    setError,
  };
}
