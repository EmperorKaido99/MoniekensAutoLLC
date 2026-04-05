import Link from 'next/link';
import Image from 'next/image';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl overflow-hidden mb-5 bg-white">
        <Image src="/images/logo.png" alt="Logo" width={64} height={64} className="w-full h-full object-contain" />
      </div>
      <p className="text-5xl font-bold text-navy mb-3">404</p>
      <h1 className="text-xl font-semibold text-navy mb-2">Page not found</h1>
      <p className="text-muted text-base mb-8 max-w-xs leading-relaxed">
        This page doesn't exist or may have been moved.
      </p>
      <Link
        href="/dashboard"
        className="bg-navy text-white font-semibold text-base px-8 py-4 rounded-xl min-h-[56px] w-full max-w-xs flex items-center justify-center gap-2"
      >
        <Home size={20} /> Go to Home
      </Link>
    </div>
  );
}
