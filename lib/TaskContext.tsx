"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type TaskStatus = "idle" | "running" | "success" | "error";

export interface BackgroundTask {
  id: string;
  name: string;
  progress: number;
  status: TaskStatus;
}

interface TaskContextType {
  tasks: BackgroundTask[];
  startTask: (id: string, name: string) => void;
  updateTaskProgress: (id: string, progress: number) => void;
  finishTask: (id: string, success: boolean) => void;
  clearTask: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);

  const startTask = useCallback((id: string, name: string) => {
    setTasks((prev) => {
      // If task already exists, don't recreate it
      if (prev.find((t) => t.id === id)) {
        return prev.map(t => t.id === id ? { ...t, status: 'running', progress: 0 } : t);
      }
      return [...prev, { id, name, progress: 0, status: 'running' }];
    });
  }, []);

  const updateTaskProgress = useCallback((id: string, progress: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, progress: Math.min(100, Math.max(0, progress)) } : t))
    );
  }, []);

  const finishTask = useCallback((id: string, success: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: success ? "success" : "error", progress: 100 } : t
      )
    );

    // Auto clear standard successful tasks after 3 seconds for clean UI
    setTimeout(() => {
      clearTask(id);
    }, 3000);
  }, []);

  const clearTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <TaskContext.Provider
      value={{ tasks, startTask, updateTaskProgress, finishTask, clearTask }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
