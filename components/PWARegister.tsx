'use client';
import { useEffect, useState } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';

type BannerType = 'android' | 'ios' | null;

// Detect iOS Safari (not standalone)
function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;
}

export default function PWARegister() {
  const [banner, setBanner] = useState<BannerType>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {/* silent */});
    }

    // Don't show banner if already installed
    if (isStandalone()) return;

    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (dismissed) return;

    // Android: listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as Event & { prompt: () => void });
      setBanner('android');
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: show manual instructions
    if (isIOS()) {
      setBanner('ios');
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    sessionStorage.setItem('pwa-banner-dismissed', '1');
    setBanner(null);
  }

  async function handleAndroidInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    setBanner(null);
  }

  if (!banner) return null;

  return (
    <div className="fixed bottom-[72px] left-0 right-0 z-50 px-4 pb-2">
      <div className="bg-navy text-white rounded-2xl p-4 shadow-xl flex items-start gap-3">
        <div className="w-9 h-9 bg-amber rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <span className="font-bold text-white text-base">D</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base leading-tight">Install MoniekensAutoLLC</p>

          {banner === 'android' && (
            <>
              <p className="text-white/70 text-sm mt-1">Add to your home screen for quick access.</p>
              <button
                onClick={handleAndroidInstall}
                className="mt-3 flex items-center gap-2 bg-amber text-white text-sm font-semibold px-4 py-2 rounded-xl min-h-[40px]"
              >
                <Download size={16} /> Install App
              </button>
            </>
          )}

          {banner === 'ios' && (
            <>
              <p className="text-white/70 text-sm mt-1">
                Tap <Share size={14} className="inline mx-0.5 align-middle" /> <strong>Share</strong> then{' '}
                <PlusSquare size={14} className="inline mx-0.5 align-middle" /> <strong>Add to Home Screen</strong>.
              </p>
            </>
          )}
        </div>

        <button
          onClick={dismiss}
          className="text-white/60 hover:text-white p-1 shrink-0"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
