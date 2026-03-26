'use client';

import { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useToastStore, type ToastSeverity } from '@/store/toastStore';

const SEVERITY_CONFIG: Record<ToastSeverity, { color: string; icon: typeof CheckCircle }> = {
  success: { color: '#2D6A4F', icon: CheckCircle },
  warning: { color: '#FFB703', icon: AlertTriangle },
  error:   { color: '#E63946', icon: XCircle },
  info:    { color: '#3B28CC', icon: Info },
};

function ToastItem({ id, message, severity, duration }: { id: string; message: string; severity: ToastSeverity; duration: number }) {
  const { removeToast, pauseToast, resumeToast } = useToastStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef(Date.now());
  const remainRef = useRef(duration);
  const { color, icon: Icon } = SEVERITY_CONFIG[severity];

  const startTimer = () => {
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => removeToast(id), remainRef.current);
  };

  const pause = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    remainRef.current -= Date.now() - startRef.current;
    pauseToast(id);
  };

  const resume = () => {
    resumeToast(id);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="sahayak-toast"
      onMouseEnter={pause}
      onMouseLeave={resume}
      style={{ '--toast-color': color } as React.CSSProperties}
    >
      <div className="sahayak-toast__border" />
      <div className="sahayak-toast__icon">
        <Icon size={16} />
      </div>
      <span className="sahayak-toast__msg">{message}</span>
      <button className="sahayak-toast__close" onClick={() => removeToast(id)} aria-label="Dismiss">
        <X size={14} />
      </button>
      <div className="sahayak-toast__progress">
        <div className="sahayak-toast__progress-fill" style={{ animationDuration: `${duration}ms` }} />
      </div>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <>
      <div className="sahayak-toast-container" role="status" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
      </div>
      <style jsx global>{`
        .sahayak-toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9000;
          display: flex;
          flex-direction: column-reverse;
          gap: 10px;
          max-width: 380px;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .sahayak-toast-container {
            top: 16px;
            bottom: auto;
            left: 16px;
            right: 16px;
            max-width: none;
            flex-direction: column;
          }
        }

        .sahayak-toast {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px 14px 0;
          border-radius: 14px;
          background: var(--bg-secondary, #16162a);
          border: 1px solid var(--glass-border, rgba(255,255,255,0.08));
          box-shadow: 0 8px 32px rgba(0,0,0,0.25);
          position: relative;
          overflow: hidden;
          animation: toastIn 0.35s cubic-bezier(0.22,1,0.36,1);
        }

        :global(.light) .sahayak-toast,
        :global([data-theme="light"]) .sahayak-toast {
          background: #FFFFFF;
          border-color: rgba(27,42,74,0.08);
          box-shadow: 0 8px 32px rgba(27,42,74,0.1);
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .sahayak-toast__border {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: 14px 0 0 14px;
          background: var(--toast-color);
        }

        .sahayak-toast__icon {
          margin-left: 16px;
          color: var(--toast-color);
          flex-shrink: 0;
          display: flex;
        }

        .sahayak-toast__msg {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary, #F8F6FF);
          line-height: 1.4;
        }

        .sahayak-toast__close {
          flex-shrink: 0;
          background: none;
          border: none;
          color: var(--text-muted, rgba(255,255,255,0.4));
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          transition: color 0.15s;
        }

        .sahayak-toast__close:hover {
          color: var(--text-primary);
        }

        .sahayak-toast__progress {
          position: absolute;
          bottom: 0;
          left: 4px;
          right: 0;
          height: 2px;
          overflow: hidden;
        }

        .sahayak-toast__progress-fill {
          height: 100%;
          background: var(--toast-color);
          opacity: 0.4;
          animation: toastProgress linear forwards;
          transform-origin: left;
        }

        @keyframes toastProgress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </>
  );
}
