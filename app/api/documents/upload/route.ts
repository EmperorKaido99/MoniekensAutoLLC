// Handles server-side document metadata validation — actual file upload happens client-side via Supabase Storage
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await req.json();
  const { id, customer_name, document_type, file_path, file_name, car_make, car_model, car_year, car_price, notes } = body;

  if (!customer_name || !document_type || !file_path || !file_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase.from('documents').insert({
    id:            id ?? undefined,
    user_id:       session.user.id,
    customer_name, document_type, file_path, file_name,
    car_make:      car_make  || null,
    car_model:     car_model || null,
    car_year:      car_year  || null,
    car_price:     car_price || null,
    notes:         notes     || null,
    qr_code_data:  id ?? crypto.randomUUID(),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ document: data });
}
