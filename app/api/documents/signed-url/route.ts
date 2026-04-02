// Returns a 60-second signed URL for a private Supabase Storage file
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const path = req.nextUrl.searchParams.get('path');
  if (!path) return NextResponse.json({ error: 'Missing path param' }, { status: 400 });

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create signed URL' }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl });
}
