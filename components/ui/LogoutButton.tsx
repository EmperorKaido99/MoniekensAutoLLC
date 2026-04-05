'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <Button variant="ghost" size="lg" fullWidth loading={loading} onClick={handleLogout}>
      <LogOut size={18} />
      Sign Out
    </Button>
  );
}
