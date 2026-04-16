import { NextRequest, NextResponse } from 'next/server';
import { extractionModel } from '@/lib/gemini';
import { getExtractionPrompt } from '@/lib/prompts';
import { ExtractionResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { exchange_name, spec_source, asset_classes = 'spot' } = await req.json();

    if (!exchange_name || !spec_source) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Step 1 — fetch spec content if URL provided
    let specContent = '';
    if (spec_source.startsWith('http')) {
      const res = await fetch(spec_source, {
        headers: { 'User-Agent': 'CryptoFIX-Auditor/1.0' }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch spec from URL: ${res.statusText}`);
      }
      specContent = await res.text();
      // Strip HTML tags for cleaner input
      specContent = specContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      // Limit to 100k chars — Gemini 1.5 Pro handles 2M tokens but we keep costs reasonable
      specContent = specContent.slice(0, 100000);
    } else {
      // Raw pasted text
      specContent = spec_source;
    }

    // Step 2 — build prompt and call Gemini Pro
    const { systemPrompt, userPrompt } = getExtractionPrompt(exchange_name, specContent, asset_classes);

    const result = await extractionModel.generateContent([
      { text: systemPrompt + '\n\n' + userPrompt }
    ]);

    const responseText = result.response.text();

    // Step 3 — parse and validate JSON
    let extraction: ExtractionResult;
    try {
      extraction = JSON.parse(responseText);
    } catch {
      // Strip any accidental markdown fences
      const clean = responseText.replace(/```json|```/g, '').trim();
      extraction = JSON.parse(clean);
    }

    // Ensure we have the basic required fields
    if (!extraction.exchange_name) extraction.exchange_name = exchange_name;
    if (!extraction.spec_source) extraction.spec_source = spec_source;
    if (!extraction.extraction_date) extraction.extraction_date = new Date().toISOString();

    return NextResponse.json(extraction);
  } catch (error: any) {
    console.error('Ingest API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
