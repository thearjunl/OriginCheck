import { NextResponse } from 'next/server';
import { humanizeText } from '../../../../src/lib/humanizer.js';

export async function POST(request) {
  try {
    const { text, strength = 'Medium' } = await request.json();

    // The humanizer function encapsulates our burstiness/perplexity logic
    const results = await humanizeText(text, { strength });

    return NextResponse.json({
      originalWordCount: results.originalWordCount,
      finalWordCount: results.finalWordCount,
      humanizedText: results.humanizedText,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to humanize text' }, { status: 500 });
  }
}
