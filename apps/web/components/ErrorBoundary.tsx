'use client';

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<Props & { onReset: () => void }, State> {
  constructor(props: Props & { onReset: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="eb">
          <div className="eb__card">
            <div className="eb__icon">
              <AlertTriangle size={36} />
            </div>
            <h3 className="eb__title">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h3>
            <p className="eb__desc">
              An unexpected error occurred. Try refreshing or go back to the dashboard.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="eb__detail">{this.state.error.message}</pre>
            )}
            <div className="eb__actions">
              <button
                className="eb__btn eb__btn--retry"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
              >
                <RefreshCw size={16} /> Try Again
              </button>
              <button
                className="eb__btn eb__btn--home"
                onClick={this.props.onReset}
              >
                <Home size={16} /> Dashboard
              </button>
            </div>
          </div>

          <style jsx>{`
            .eb {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 320px;
              padding: 32px;
            }
            .eb__card {
              background: var(--glass-bg, rgba(255,255,255,0.04));
              backdrop-filter: blur(24px) saturate(140%);
              border: 1px solid var(--glass-border, rgba(255,255,255,0.08));
              border-radius: 20px;
              padding: 40px 32px;
              max-width: 420px;
              text-align: center;
            }
            .eb__icon {
              color: var(--sah-rose, #FF4B8A);
              margin-bottom: 16px;
            }
            .eb__title {
              color: var(--text-primary);
              font-size: 20px;
              font-weight: 700;
              margin: 0 0 8px;
            }
            .eb__desc {
              color: var(--text-secondary);
              font-size: 14px;
              line-height: 1.5;
              margin: 0 0 20px;
            }
            .eb__detail {
              background: rgba(255,75,138,0.08);
              border: 1px solid rgba(255,75,138,0.15);
              border-radius: 8px;
              padding: 10px;
              font-size: 12px;
              color: var(--sah-rose, #FF4B8A);
              white-space: pre-wrap;
              word-break: break-word;
              margin-bottom: 20px;
              text-align: left;
            }
            .eb__actions {
              display: flex;
              gap: 10px;
              justify-content: center;
            }
            .eb__btn {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 10px 20px;
              border-radius: 10px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              border: none;
              transition: all 0.2s ease;
            }
            .eb__btn--retry {
              background: var(--sah-saffron, #FF6B2C);
              color: #fff;
            }
            .eb__btn--retry:hover {
              opacity: 0.9;
              transform: translateY(-1px);
            }
            .eb__btn--home {
              background: var(--glass-bg, rgba(255,255,255,0.06));
              color: var(--text-primary);
              border: 1px solid var(--glass-border, rgba(255,255,255,0.1));
            }
            .eb__btn--home:hover {
              background: var(--glass-bg-hover, rgba(255,255,255,0.08));
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper to get access to Next.js router hook
export default function ErrorBoundary({ children, fallbackTitle }: Props) {
  const router = useRouter();
  return (
    <ErrorBoundaryInner
      fallbackTitle={fallbackTitle}
      onReset={() => router.push('/dashboard')}
    >
      {children}
    </ErrorBoundaryInner>
  );
}
