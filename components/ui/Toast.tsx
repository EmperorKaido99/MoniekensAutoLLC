'use client';
import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface Props {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, type, onDismiss, duration = 3500 }: Props) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  return (
    <div
      className={[
        'fixed left-4 right-4 z-50 flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg',
        'animate-in slide-in-from-bottom-4 fade-in duration-200',
        type === 'success' ? 'bg-success text-white' : 'bg-danger text-white',
      ].join(' ')}
      style={{ bottom: '88px' }}
      role="alert"
    >
      {type === 'success'
        ? <CheckCircle size={20} className="shrink-0 mt-0.5" />
        : <XCircle size={20} className="shrink-0 mt-0.5" />
      }
      <p className="flex-1 text-base font-medium leading-snug">{message}</p>
      <button onClick={onDismiss} className="shrink-0 mt-0.5 opacity-80 hover:opacity-100" aria-label="Dismiss">
        <X size={18} />
      </button>
    </div>
  );
}
