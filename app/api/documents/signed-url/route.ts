// API route — returns a short-lived Supabase Storage signed URL for a private document
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'signed-url placeholder' });
}
