'use client';
import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DocumentActions({ filePath }: { filePath: string }) {
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingPrint,    setLoadingPrint]    = useState(false);

  async function getSignedUrl(): Promise<string> {
    const res = await fetch(`/api/documents/signed-url?path=${encodeURIComponent(filePath)}`);
    const { signedUrl } = await res.json();
    return signedUrl;
  }

  async function handleDownload() {
    setLoadingDownload(true);
    try {
      const url = await getSignedUrl();
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() ?? 'document.pdf';
      a.click();
    } finally {
      setLoadingDownload(false);
    }
  }

  async function handlePrint() {
    setLoadingPrint(true);
    try {
      const url = await getSignedUrl();
      window.open(url, '_blank');
    } finally {
      setLoadingPrint(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant="secondary" size="lg" fullWidth loading={loadingDownload} onClick={handleDownload}>
        <Download size={18} /> Download Document
      </Button>
      <Button variant="secondary" size="lg" fullWidth loading={loadingPrint} onClick={handlePrint}>
        <Printer size={18} /> Print Document
      </Button>
    </div>
  );
}
