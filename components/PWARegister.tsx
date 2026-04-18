'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PUBLIC_ROUTE_PREFIXES = ['/q/'];

export default function PWARegister() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    if (PUBLIC_ROUTE_PREFIXES.some((p) => pathname.startsWith(p))) return;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, [pathname]);
  return null;
}
