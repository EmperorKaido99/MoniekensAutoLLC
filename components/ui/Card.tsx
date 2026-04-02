import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5' };

export default function Card({ children, padding = 'md', className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-card rounded-2xl shadow-sm ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
