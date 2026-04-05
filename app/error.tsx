'use client';
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-danger/10 rounded-2xl flex items-center justify-center mb-5">
        <AlertTriangle size={28} className="text-danger" />
      </div>
      <h1 className="text-xl font-bold text-navy mb-2">Something went wrong</h1>
      <p className="text-muted text-base mb-8 max-w-xs leading-relaxed">
        An unexpected error occurred. Your data is safe — please try again.
      </p>
      <button
        onClick={reset}
        className="bg-navy text-white font-semibold text-base px-8 py-4 rounded-xl min-h-[56px] w-full max-w-xs"
      >
        Try Again
      </button>
      <a
        href="/dashboard"
        className="mt-3 text-amber font-semibold text-base min-h-[48px] flex items-center justify-center"
      >
        Go to Home
      </a>
    </div>
  );
}
