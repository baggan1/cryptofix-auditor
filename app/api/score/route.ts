import { NextRequest, NextResponse } from 'next/server';
import { scoreExtraction } from '@/lib/scorer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { extraction_result } = await req.json();
    
    if (!extraction_result) {
      return NextResponse.json({ error: 'Missing extraction_result' }, { status: 400 });
    }

    const scored = scoreExtraction(extraction_result);
    return NextResponse.json(scored);
  } catch (error: any) {
    console.error('Score API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
