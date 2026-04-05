'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera } from 'lucide-react';

interface Props {
  onScan:   (data: string) => void;
  onError?: (err: string) => void;
}

export default function QRScanner({ onScan, onError }: Props) {
  const [started,   setStarted]   = useState(false);
  const [scanning,  setScanning]  = useState(false);
  const scannerRef  = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const elementId   = 'qr-scanner-element';

  useEffect(() => {
    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
        (decodedText) => { onScan(decodedText); },
        undefined,
      )
      .then(() => setStarted(true))
      .catch((err: unknown) => {
        // Auto-start failed — user will use the capture button instead
        setStarted(true);
        console.warn('Auto-scan unavailable:', err);
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;
    setScanning(true);
    try {
      const result = await scannerRef.current.scanFile(file, false);
      onScan(result);
    } catch {
      onError?.('No QR code found in the photo. Try again with the code clearly visible.');
    } finally {
      setScanning(false);
      // Reset so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [onScan, onError]);

  return (
    <div className="relative w-full">
      {/* Live viewfinder */}
      <div id={elementId} className="w-full" />

      {!started && (
        <div className="absolute inset-0 flex items-center justify-center bg-black min-h-[280px]">
          <p className="text-white text-base">Starting camera…</p>
        </div>
      )}

      {/* Manual capture button */}
      <div className="bg-black py-4 flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCapture}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning}
          className="flex items-center gap-2 bg-amber text-white font-semibold text-base px-8 py-4 rounded-2xl min-h-[56px] active:scale-95 transition-transform disabled:opacity-60"
        >
          <Camera size={22} />
          {scanning ? 'Reading QR code…' : 'Tap to Scan'}
        </button>
        <p className="text-gray-500 text-xs">Or align QR code in the frame above</p>
      </div>
    </div>
  );
}
