// DocumentCard — summary card for a single document shown in the documents list
import type { Document } from '@/types/document';

export default function DocumentCard({ document }: { document: Document }) {
  return <div className="rounded-lg border p-4">{document.id}</div>;
}
