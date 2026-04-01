// API route — uses Anthropic SDK to extract structured fields from an uploaded document image
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'extract-document placeholder' });
}
