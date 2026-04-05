import Skeleton from '@/components/ui/Skeleton';

export default function CalendarLoading() {
  return (
    <div className="min-h-screen bg-app pb-24">
      <div className="bg-navy px-4 pt-4 pb-5">
        <Skeleton className="h-7 w-28 bg-white/20 mb-1.5" />
        <Skeleton className="h-4 w-24 bg-white/10" />
      </div>
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-36" />
          <Skeleton className="w-10 h-10 rounded-xl" />
        </div>
        <Skeleton className="w-full h-72 rounded-2xl" />
        <Skeleton className="h-5 w-40" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    </div>
  );
}
