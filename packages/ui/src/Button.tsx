'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'sah-btn--primary',
  secondary: 'sah-btn--secondary',
  ghost: 'sah-btn--ghost',
  outline: 'sah-btn--outline',
  danger: 'sah-btn--danger',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'sah-btn--sm',
  md: 'sah-btn--md',
  lg: 'sah-btn--lg',
  xl: 'sah-btn--xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      isLoading = false,
      fullWidth = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) {
    const classes = [
      'sah-btn',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'sah-btn--full' : '',
      isLoading ? 'sah-btn--loading' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <span className="sah-btn__spinner" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </span>
        )}
        {icon && iconPosition === 'left' && !isLoading && (
          <span className="sah-btn__icon" aria-hidden="true">{icon}</span>
        )}
        {children && <span className="sah-btn__label">{children}</span>}
        {icon && iconPosition === 'right' && !isLoading && (
          <span className="sah-btn__icon" aria-hidden="true">{icon}</span>
        )}
      </button>
    );
  }
);
