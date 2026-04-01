// API route — uses Anthropic SDK to draft a vehicle deed of sale from provided fields
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'generate-deed placeholder' });
}
