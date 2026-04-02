'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function ResolveInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type');
    const id   = searchParams.get('id');

    if (type === 'quote'    && id) { router.replace(`/quotes/${id}`);    return; }
    if (type === 'document' && id) { router.replace(`/documents/${id}`); return; }

    // Unknown — go to scan page
    router.replace('/scan');
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" color="navy" />
      <p className="text-navy text-base font-medium">Opening record…</p>
    </div>
  );
}

export default function ScanResolvePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-app flex items-center justify-center">
        <LoadingSpinner size="lg" color="navy" />
      </div>
    }>
      <ResolveInner />
    </Suspense>
  );
}
