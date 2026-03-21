'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

type CardVariant = 'glass' | 'glass-hover' | 'solid' | 'outline';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  glow?: 'none' | 'saffron' | 'indigo' | 'jade';
  header?: ReactNode;
  footer?: ReactNode;
  accentBorder?: 'none' | 'left' | 'top';
  accentColor?: string;
}

const variantClasses: Record<CardVariant, string> = {
  glass: 'glass-card',
  'glass-hover': 'glass-card glass-card--hover',
  solid: 'sah-card--solid',
  outline: 'sah-card--outline',
};

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'sah-card--pad-sm',
  md: 'sah-card--pad-md',
  lg: 'sah-card--pad-lg',
  xl: 'sah-card--pad-xl',
};

const glowClasses: Record<string, string> = {
  none: '',
  saffron: 'sah-card--glow-saffron',
  indigo: 'sah-card--glow-indigo',
  jade: 'sah-card--glow-jade',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card(
    {
      variant = 'glass',
      padding = 'md',
      glow = 'none',
      header,
      footer,
      accentBorder = 'none',
      accentColor,
      children,
      className = '',
      style,
      ...props
    },
    ref
  ) {
    const classes = [
      'sah-card',
      variantClasses[variant],
      paddingClasses[padding],
      glowClasses[glow],
      accentBorder !== 'none' ? `sah-card--accent-${accentBorder}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const mergedStyle = accentColor
      ? { ...style, '--accent-color': accentColor } as React.CSSProperties
      : style;

    return (
      <div ref={ref} className={classes} style={mergedStyle} {...props}>
        {header && <div className="sah-card__header">{header}</div>}
        <div className="sah-card__body">{children}</div>
        {footer && <div className="sah-card__footer">{footer}</div>}
      </div>
    );
  }
);
