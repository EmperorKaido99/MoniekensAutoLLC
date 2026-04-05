import { ReactNode } from 'react';
import Image from 'next/image';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  /** Slot for a right-side action (e.g. a Settings icon button) */
  action?: ReactNode;
  /** Show the company logo row above the title */
  showBranding?: boolean;
}

export default function TopHeader({ title, subtitle, action, showBranding = false }: TopHeaderProps) {
  return (
    <header className="bg-navy text-white px-4 pt-4 pb-5">
      {showBranding && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white">
            <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight">MoniekensAutoLLC</p>
            <p className="text-white/60 text-xs">Business Management</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="text-white/70 text-sm mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 mt-0.5">{action}</div>}
      </div>
    </header>
  );
}
