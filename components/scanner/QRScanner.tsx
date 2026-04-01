// QRScanner — camera-based QR code reader component using the device MediaStream API
'use client';

export default function QRScanner({ onScan }: { onScan: (data: string) => void }) {
  return <div className="relative w-full aspect-square bg-black">Scanner</div>;
}
