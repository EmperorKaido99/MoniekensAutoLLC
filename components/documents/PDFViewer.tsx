'use client';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ExternalLink } from 'lucide-react';

export default function PDFViewer({ filePath }: { filePath: string }) {
  const [url,     setUrl]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    fetch(`/api/documents/signed-url?path=${encodeURIComponent(filePath)}`)
      .then(r => r.json())
      .then(({ signedUrl, error: err }) => {
        if (err) setError(err);
        else setUrl(signedUrl);
      })
      .catch(() => setError('Failed to load document'))
      .finally(() => setLoading(false));
  }, [filePath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" color="navy" />
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <p className="text-muted text-base">Could not load document preview.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Open in new tab button for better mobile experience */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-navy text-white rounded-xl py-3 font-semibold text-base min-h-[48px]"
      >
        <ExternalLink size={18} /> Open PDF
      </a>

      {/* Inline iframe — works well on desktop, mobile opens native viewer */}
      <div className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: '70vh' }}>
        <iframe
          src={`${url}#toolbar=0`}
          className="w-full h-full border-0"
          title="Document Preview"
        />
      </div>
    </div>
  );
}
