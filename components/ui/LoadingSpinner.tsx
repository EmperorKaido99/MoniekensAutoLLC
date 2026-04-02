interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'white' | 'navy' | 'amber';
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
const colors = { white: 'border-white/30 border-t-white', navy: 'border-navy/30 border-t-navy', amber: 'border-amber/30 border-t-amber' };

export default function LoadingSpinner({ size = 'md', color = 'navy' }: LoadingSpinnerProps) {
  return (
    <div
      className={`${sizes[size]} ${colors[color]} rounded-full border-2 animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
}
