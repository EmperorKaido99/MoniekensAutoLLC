import Skeleton from '@/components/ui/Skeleton';

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-app pb-24">
      <div className="bg-navy px-4 pt-4 pb-5">
        <Skeleton className="h-7 w-24 bg-white/20 mb-1.5" />
        <Skeleton className="h-4 w-48 bg-white/10" />
      </div>

      <div className="px-4 py-5 space-y-6">
        <div>
          <Skeleton className="h-4 w-40 mb-4" />
          <div className="space-y-4 bg-white rounded-2xl p-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-14 w-full mt-4 rounded-xl" />
        </div>

        <div>
          <Skeleton className="h-4 w-36 mb-4" />
          <div className="space-y-4 bg-white rounded-2xl p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="h-14 w-full mt-4 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
