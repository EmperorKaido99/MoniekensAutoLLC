'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search } from 'lucide-react';

export default function DocumentSearch() {
  const router      = useRouter();
  const pathname    = usePathname();
  const params      = useSearchParams();
  const [, startTransition] = useTransition();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val    = e.target.value;
      const newParams = new URLSearchParams(params.toString());
      if (val) newParams.set('q', val);
      else newParams.delete('q');
      startTransition(() => router.replace(`${pathname}?${newParams.toString()}`));
    },
    [router, pathname, params]
  );

  return (
    <div className="relative px-4 pb-2">
      <Search size={18} className="absolute left-7 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      <input
        type="search"
        defaultValue={params.get('q') ?? ''}
        onChange={handleChange}
        placeholder="Search by customer, make or model..."
        className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-3 text-base text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber"
      />
    </div>
  );
}
