// Button — reusable Tailwind-styled button with variant and size props
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({ variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}
