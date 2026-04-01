// API route — uses Anthropic SDK to produce a plain-language summary of a document
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'summarise-document placeholder' });
}
