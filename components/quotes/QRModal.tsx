'use client';
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { generateQRDataUrl } from '@/lib/qr';

interface Props {
  open:        boolean;
  onClose:     () => void;
  qrPayload:   string;
  quoteNumber: string;
}

export default function QRModal({ open, onClose, qrPayload, quoteNumber }: Props) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (open && qrPayload) {
      generateQRDataUrl(qrPayload).then(setDataUrl);
    }
  }, [open, qrPayload]);

  return (
    <Modal open={open} onClose={onClose} title={`QR Code — ${quoteNumber}`}>
      <div className="flex flex-col items-center gap-5 py-2">
        {dataUrl ? (
          <img src={dataUrl} alt="QR Code" className="w-52 h-52 rounded-lg border border-gray-200" />
        ) : (
          <div className="w-52 h-52 rounded-lg border border-gray-200 bg-gray-50 animate-pulse" />
        )}
        <p className="text-muted text-sm text-center leading-relaxed">
          Scan this code to open quote {quoteNumber} directly on any device.
        </p>
        {dataUrl && (
          <a href={dataUrl} download={`qr-${quoteNumber}.png`} className="w-full">
            <Button variant="secondary" size="lg" fullWidth>
              <Download size={18} /> Download QR Image
            </Button>
          </a>
        )}
      </div>
    </Modal>
  );
}
