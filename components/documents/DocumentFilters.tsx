'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const FILTERS = [
  { label: 'All',          href: '/documents' },
  { label: 'This Week',    href: '/documents?period=week' },
  { label: 'This Month',   href: '/documents?period=month' },
  { label: 'Deed of Sale', href: '/documents?type=deed_of_sale' },
  { label: 'Invoices',     href: '/documents?type=invoice' },
  { label: 'Quotes',       href: '/documents?type=quote' },
];

function activeKey(period?: string | null, type?: string | null): string {
  if (period) return `/documents?period=${period}`;
  if (type)   return `/documents?type=${type}`;
  return '/documents';
}

export default function DocumentFilters() {
  const params  = useSearchParams();
  const current = activeKey(params.get('period'), params.get('type'));

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none py-3 px-4">
      {FILTERS.map(f => (
        <Link
          key={f.href}
          href={f.href}
          className={[
            'px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0',
            current === f.href
              ? 'bg-navy text-white'
              : 'bg-gray-100 text-muted hover:bg-gray-200',
          ].join(' ')}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
