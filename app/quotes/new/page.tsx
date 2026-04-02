import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import { Ship, Container, Truck, ChevronRight } from 'lucide-react';

const QUOTE_TYPES = [
  {
    href:        '/quotes/new/export',
    icon:        Ship,
    title:       'Vehicle Export',
    description: 'Cars loaded into shipping containers for export',
    color:       'bg-navy',
  },
  {
    href:        '/quotes/new/container',
    icon:        Container,
    title:       'Container Transport',
    description: 'Moving shipping containers on land',
    color:       'bg-info',
  },
  {
    href:        '/quotes/new/towing',
    icon:        Truck,
    title:       'Local Towing',
    description: 'Towing individual vehicles locally',
    color:       'bg-amber',
  },
];

export default async function NewQuotePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-app pb-24">
      <TopHeader title="New Quote" subtitle="Select the service type" />

      <div className="px-4 py-5 space-y-3">
        {QUOTE_TYPES.map(({ href, icon: Icon, title, description, color }) => (
          <Link key={href} href={href}>
            <Card className="flex items-center gap-4 active:scale-[0.99] transition-transform cursor-pointer">
              <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center shrink-0`}>
                <Icon size={26} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy text-lg">{title}</p>
                <p className="text-muted text-sm mt-0.5">{description}</p>
              </div>
              <ChevronRight size={20} className="text-muted shrink-0" />
            </Card>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
