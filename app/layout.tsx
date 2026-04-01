// Root layout — wraps every page with global styles and PWA meta tags
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Dad's Auto Group",
  description: 'Mobile-first PWA for auto group management',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
