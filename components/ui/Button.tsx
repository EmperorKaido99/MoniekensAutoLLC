'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variants = {
  primary:   'bg-amber text-white hover:opacity-90 active:opacity-80',
  secondary: 'bg-white text-navy border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
  danger:    'bg-danger text-white hover:opacity-90 active:opacity-80',
  ghost:     'bg-transparent text-navy hover:bg-gray-100 active:bg-gray-200',
};

const sizes = {
  sm: 'px-4 py-2 text-sm min-h-[40px]',
  md: 'px-5 py-3 text-base min-h-[48px]',
  lg: 'px-6 py-4 text-lg min-h-[56px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-opacity',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading && <LoadingSpinner size="sm" color={variant === 'secondary' || variant === 'ghost' ? 'navy' : 'white'} />}
      {children}
    </button>
  );
}
