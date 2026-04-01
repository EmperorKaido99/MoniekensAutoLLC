// API route — generates a PDF for a given quote or document and returns it as a buffer
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'generate-pdf placeholder' });
}
