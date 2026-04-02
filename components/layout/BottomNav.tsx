'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, FolderOpen, ScanLine } from 'lucide-react';

const tabs = [
  { label: 'Home',      href: '/dashboard', icon: Home },
  { label: 'Quotes',    href: '/quotes',    icon: FileText },
  { label: 'Documents', href: '/documents', icon: FolderOpen },
  { label: 'Scan',      href: '/scan',      icon: ScanLine },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-gray-200 safe-area-bottom">
      <div className="flex items-stretch">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors',
                active ? 'text-amber' : 'text-muted',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-xs font-${active ? 'semibold' : 'medium'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
