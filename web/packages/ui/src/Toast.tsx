'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (msg: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
}

// ═══════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

// ═══════════════════════════════════════════
// SINGLE TOAST
// ═══════════════════════════════════════════

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const typeClasses: Record<ToastType, string> = {
  success: 'sah-toast--success',
  error: 'sah-toast--error',
  warning: 'sah-toast--warning',
  info: 'sah-toast--info',
};

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setTimeout(() => {
        onDismiss(t.id);
      }, t.duration || 5000);
    }
    return () => clearTimeout(timerRef.current);
  }, [t.id, t.duration, onDismiss, isPaused]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      className={`sah-toast glass-card ${typeClasses[t.type]}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      aria-live="polite"
    >
      <span className="sah-toast__icon" aria-hidden="true">
        {typeIcons[t.type]}
      </span>
      <div className="sah-toast__content">
        <p className="sah-toast__title">{t.title}</p>
        {t.description && <p className="sah-toast__desc">{t.description}</p>}
      </div>
      <button
        className="sah-toast__close"
        onClick={() => onDismiss(t.id)}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { ...msg, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="sah-toast-container" aria-label="Notifications">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
