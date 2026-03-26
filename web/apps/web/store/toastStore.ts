import { create } from 'zustand';

export type ToastSeverity = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration: number; // ms
  createdAt: number;
  paused: boolean;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, severity?: ToastSeverity, duration?: number) => void;
  removeToast: (id: string) => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
}

let counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (message, severity = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${counter++}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, message, severity, duration, createdAt: Date.now(), paused: false }],
    }));
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  pauseToast: (id) =>
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, paused: true } : t)),
    })),

  resumeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, paused: false } : t)),
    })),
}));
