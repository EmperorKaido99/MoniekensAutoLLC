'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import UploadModal from './UploadModal';

export default function DocumentUploadButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-amber text-white text-sm font-semibold px-3 py-2 rounded-xl min-h-[40px]"
      >
        <Plus size={16} /> Upload
      </button>
      <UploadModal open={open} onClose={() => setOpen(false)} userId={userId} />
    </>
  );
}
