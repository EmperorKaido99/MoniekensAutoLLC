// Receives a base64-encoded PDF, uploads it to Supabase Storage, updates the quote record
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { quote_id, pdf_base64, file_name } = await req.json();
  if (!quote_id || !pdf_base64) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Decode base64 → buffer
  const buffer = Buffer.from(pdf_base64, 'base64');
  const path   = `quotes/${session.user.id}/${quote_id}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, buffer, { contentType: 'application/pdf', upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Persist the storage path on the quote row
  await supabase.from('quotes').update({ pdf_url: path }).eq('id', quote_id);

  return NextResponse.json({ path });
}
