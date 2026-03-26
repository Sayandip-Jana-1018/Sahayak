'use client';

import type { HTMLAttributes, ReactNode } from 'react';

type BadgeVariant = 'default' | 'saffron' | 'indigo' | 'jade' | 'gold' | 'rose';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  pulse?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'sah-badge--default',
  saffron: 'sah-badge--saffron',
  indigo: 'sah-badge--indigo',
  jade: 'sah-badge--jade',
  gold: 'sah-badge--gold',
  rose: 'sah-badge--rose',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'sah-badge--sm',
  md: 'sah-badge--md',
  lg: 'sah-badge--lg',
};

export function Badge({
  variant = 'default',
  size = 'md',
  icon,
  pulse = false,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const classes = [
    'sah-badge',
    variantClasses[variant],
    sizeClasses[size],
    pulse ? 'sah-badge--pulse' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...props}>
      {pulse && <span className="sah-badge__pulse" aria-hidden="true" />}
      {icon && <span className="sah-badge__icon" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
