// Supabase server client — cookie-based client for use in Server Components and API routes
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c) => {
          try {
            c.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Ignored: setAll is called from a Server Component where cookie writes are not allowed.
            // The middleware refreshes the session cookie on every request.
          }
        },
      },
    },
  );
}
