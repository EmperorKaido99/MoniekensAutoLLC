// Quote detail — displays a single quote with edit, PDF export, and status actions
export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  return <main className="p-4">Quote {params.id}</main>;
}
