// API route — receives a multipart file upload and stores it in Supabase Storage
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'upload placeholder' });
}
