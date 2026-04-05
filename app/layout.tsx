import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWARegister from '@/components/PWARegister';

export const metadata: Metadata = {
  title: "MoniekensAutoLLC",
  description: 'Business management app — quotes, documents & QR scanning',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: "MoniekensAutoLLC" },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1B4D73',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-app antialiased">
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
