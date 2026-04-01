// Document detail — shows extracted fields, AI summary, and download link
export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return <main className="p-4">Document {params.id}</main>;
}
