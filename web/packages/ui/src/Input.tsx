'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  variant?: 'glass' | 'solid';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      hint,
      icon,
      variant = 'glass',
      className = '',
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    const wrapperClasses = [
      'sah-input-wrapper',
      variant === 'glass' ? 'sah-input--glass' : 'sah-input--solid',
      isFocused ? 'sah-input--focused' : '',
      error ? 'sah-input--error' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className="sah-input__label">
            {label}
          </label>
        )}
        <div className="sah-input__field-wrapper">
          {icon && <span className="sah-input__icon" aria-hidden="true">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className="sah-input__field"
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {error && (
          <span id={`${inputId}-error`} className="sah-input__error" role="alert">
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${inputId}-hint`} className="sah-input__hint">
            {hint}
          </span>
        )}
      </div>
    );
  }
);
