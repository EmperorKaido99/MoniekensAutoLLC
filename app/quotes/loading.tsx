import Skeleton from '@/components/ui/Skeleton';

export default function QuotesLoading() {
  return (
    <div className="min-h-screen bg-app pb-24">
      {/* Header */}
      <div className="bg-navy px-4 pt-4 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-24 bg-white/20" />
            <Skeleton className="h-4 w-16 bg-white/10" />
          </div>
          <Skeleton className="h-9 w-20 bg-white/20" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex gap-2">
        {['w-20', 'w-16', 'w-16', 'w-14'].map((w, i) => (
          <Skeleton key={i} className={`h-9 rounded-full ${w}`} />
        ))}
      </div>

      {/* Search bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>

      {/* Cards */}
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}
