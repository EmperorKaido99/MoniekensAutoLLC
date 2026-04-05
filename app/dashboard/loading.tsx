import Skeleton from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-app pb-24">
      {/* Header skeleton */}
      <div className="bg-navy px-4 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-white/20" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-white/20 rounded-lg" />
            <div className="h-3 w-24 bg-white/10 rounded-lg" />
          </div>
        </div>
        <div className="h-7 w-44 bg-white/20 rounded-lg mb-1.5" />
        <div className="h-4 w-56 bg-white/10 rounded-lg" />
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/10 rounded-2xl p-3 text-center space-y-1.5">
              <div className="h-6 w-10 bg-white/20 rounded mx-auto" />
              <div className="h-3 w-14 bg-white/10 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Quick actions */}
        <div>
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>

        {/* Recent quotes */}
        <div>
          <Skeleton className="h-4 w-36 mb-3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
