import Skeleton from '@/components/ui/Skeleton';

export default function DocumentsLoading() {
  return (
    <div className="min-h-screen bg-app pb-24">
      {/* Header */}
      <div className="bg-navy px-4 pt-4 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-32 bg-white/20" />
            <Skeleton className="h-4 w-20 bg-white/10" />
          </div>
          <Skeleton className="h-9 w-9 rounded-xl bg-white/20" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 space-y-3">
        <div className="flex gap-2">
          {['w-20', 'w-16', 'w-24', 'w-20'].map((w, i) => (
            <Skeleton key={i} className={`h-8 rounded-full ${w}`} />
          ))}
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      {/* Cards */}
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}
