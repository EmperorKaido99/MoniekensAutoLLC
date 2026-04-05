'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ScanLine, AlertCircle } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import Button from '@/components/ui/Button';

const QRScanner = dynamic(() => import('@/components/scanner/QRScanner'), { ssr: false });

export default function ScanPage() {
  const router = useRouter();
  const [error,     setError]     = useState('');
  const [scanned,   setScanned]   = useState(false);

  const handleScan = useCallback((data: string) => {
    if (scanned) return;
    setScanned(true);
    setError('');

    try {
      // If it's a URL (our QR codes embed full URLs)
      const url = new URL(data);
      router.push(url.pathname + url.search);
      return;
    } catch {
      // Not a URL — ignore
    }

    // Try JSON payload fallback { type, id }
    try {
      const payload = JSON.parse(data) as { type: string; id: string };
      if (payload.type === 'quote')    { router.push(`/quotes/${payload.id}`);    return; }
      if (payload.type === 'document') { router.push(`/documents/${payload.id}`); return; }
    } catch {
      // Not JSON either
    }

    setError('This QR code is not linked to a MoniekensAutoLLC record.');
    setScanned(false);
  }, [scanned, router]);

  const handleError = useCallback((err: string) => {
    if (err.includes('permission') || err.includes('NotAllowed')) {
      setError('Camera permission denied. Please allow camera access and reload.');
    } else {
      setError('Could not start camera. Make sure no other app is using it.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col pb-24">
      {/* Header */}
      <div className="bg-navy px-4 py-4 flex items-center gap-3 safe-top">
        <ScanLine size={22} className="text-amber" />
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Scan QR Code</h1>
          <p className="text-blue-200 text-sm">Point at a vehicle or document QR code</p>
        </div>
      </div>

      {/* Camera area */}
      <div className="flex-1 flex flex-col items-center justify-start pt-4 px-4 gap-4">
        {error ? (
          <div className="w-full bg-danger/10 border border-danger/30 rounded-2xl p-5 flex flex-col items-center gap-3 mt-8">
            <AlertCircle size={32} className="text-danger" />
            <p className="text-white text-center text-base">{error}</p>
            <Button variant="secondary" size="md" onClick={() => { setError(''); setScanned(false); }}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border-2 border-amber/50">
              <QRScanner onScan={handleScan} onError={handleError} />
            </div>
            <p className="text-gray-400 text-sm text-center">
              Align the QR code within the frame to scan
            </p>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
