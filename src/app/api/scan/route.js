import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, filename } = await request.json();

    // Mock processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock similarity response
    const data = {
      similarityScore: 45,
      aiProbability: 28,
      matches: [
        {
          id: 'match-1',
          type: 'plagiarism',
          text: 'Artificial intelligence (AI) has become a transformative force',
          source: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
          matchPercentage: 100,
        },
        {
          id: 'match-2',
          type: 'ai-generated',
          text: 'Deep learning, which uses neural networks with multiple layers, has achieved remarkable breakthroughs',
          source: 'AI Detection Engine',
          matchPercentage: 85,
        }
      ]
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to scan document' }, { status: 500 });
  }
}
