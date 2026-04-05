'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search, X } from 'lucide-react';

export default function QuoteSearchBar({ value }: { value: string }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateSearch = useCallback((q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams]);

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      <input
        type="search"
        inputMode="search"
        placeholder="Search by customer or quote #"
        defaultValue={value}
        onChange={e => updateSearch(e.target.value)}
        className="w-full pl-9 pr-9 py-2.5 text-base bg-gray-100 rounded-xl border border-transparent focus:border-navy focus:bg-white focus:outline-none transition-colors placeholder:text-muted"
      />
      {value && (
        <button
          onClick={() => updateSearch('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
