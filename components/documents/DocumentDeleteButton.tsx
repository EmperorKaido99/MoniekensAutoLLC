'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Trash2 } from 'lucide-react';

export default function DocumentDeleteButton({ docId }: { docId: string }) {
  const router  = useRouter();
  const [open,     setOpen]     = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('documents').delete().eq('id', docId);
    router.push('/documents');
  }

  return (
    <>
      <Button variant="danger" size="lg" fullWidth onClick={() => setOpen(true)}>
        <Trash2 size={18} /> Delete Document
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </>
  );
}
