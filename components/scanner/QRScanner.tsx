'use client';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  onScan:  (data: string) => void;
  onError?: (err: string) => void;
}

export default function QRScanner({ onScan, onError }: Props) {
  const [started, setStarted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId  = 'qr-scanner-element';

  useEffect(() => {
    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
        (decodedText) => {
          onScan(decodedText);
        },
        undefined,
      )
      .then(() => setStarted(true))
      .catch((err: unknown) => {
        onError?.(String(err));
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full">
      <div id={elementId} className="w-full" />
      {!started && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <p className="text-white text-base">Starting camera…</p>
        </div>
      )}
    </div>
  );
}
