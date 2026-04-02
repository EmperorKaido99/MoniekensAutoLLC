import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentFilters from '@/components/documents/DocumentFilters';
import DocumentSearch from '@/components/documents/DocumentSearch';
import DocumentUploadButton from '@/components/documents/DocumentUploadButton';
import type { VaultDocument } from '@/types/document';

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; period?: string; type?: string }>;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { q, period, type } = await searchParams;
  const now = new Date();

  let query = supabase
    .from('documents')
    .select('*')
    .eq('user_id', session.user.id)
    .order('uploaded_at', { ascending: false });

  if (period === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    query = query.gte('uploaded_at', weekAgo.toISOString());
  } else if (period === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    query = query.gte('uploaded_at', startOfMonth.toISOString());
  }

  if (type) query = query.eq('document_type', type);

  if (q?.trim()) {
    query = query.or(
      `customer_name.ilike.%${q}%,car_make.ilike.%${q}%,car_model.ilike.%${q}%`
    );
  }

  const { data: docs } = await query;

  return (
    <div className="min-h-screen bg-app pb-24">
      <TopHeader
        title="Documents"
        subtitle={`${docs?.length ?? 0} record${docs?.length !== 1 ? 's' : ''}`}
        action={
          <DocumentUploadButton userId={session.user.id} />
        }
      />

      {/* Filters + Search */}
      <div className="bg-white border-b border-gray-100">
        <Suspense>
          <DocumentFilters />
        </Suspense>
        <Suspense>
          <DocumentSearch />
        </Suspense>
      </div>

      <div className="px-4 py-4 space-y-3">
        {!docs?.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted text-lg font-medium">No documents found</p>
            <p className="text-muted text-sm mt-1">
              {q || period || type ? 'Try adjusting your filters' : 'Tap + to upload your first document'}
            </p>
          </div>
        ) : (
          docs.map(doc => <DocumentCard key={doc.id} doc={doc as VaultDocument} />)
        )}
      </div>

      <BottomNav />
    </div>
  );
}
