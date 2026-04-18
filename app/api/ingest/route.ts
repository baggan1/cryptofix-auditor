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

    const exchange_slug = exchange_name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

    // Step 1 — fetch spec content if URL provided
    let specContent = '';
    if (spec_source.startsWith('http')) {
      try {
        const fetchPage = async (url: string) => {
          const res = await fetch(url, { headers: { 'User-Agent': 'CryptoFIX-Auditor/1.0' } });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          return res.text();
        };

        let html = await fetchPage(spec_source);
        specContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        const KNOWN_SUBPAGES: Record<string, string[]> = {
          'docs.cdp.coinbase.com/international-exchange': [
            'https://docs.cdp.coinbase.com/international-exchange/fix-api/fix-api-overview',
            'https://docs.cdp.coinbase.com/international-exchange/fix-api/admin-messages',
          ],
          'docs.kraken.com': [
            'https://docs.kraken.com/api/docs/fix-api/er-fix',
            'https://docs.kraken.com/api/docs/fix-api/cancel-fix',
          ],
        };

        const hostname = new URL(spec_source).hostname + new URL(spec_source).pathname;
        for (const [pattern, subpages] of Object.entries(KNOWN_SUBPAGES)) {
          if (hostname.includes(pattern)) {
            for (const subUrl of subpages) {
              try {
                const subHtml = await fetchPage(subUrl);
                const subClean = subHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                specContent += '\n\n--- SUB-PAGE: ' + subUrl + ' ---\n\n' + subClean.slice(0, 15000);
              } catch (e) {
                console.warn('Sub-page fetch failed:', subUrl, e);
              }
            }
            break;
          }
        }

        // Trim to 60k chars but try to end at a natural boundary
        let trimmed = specContent.slice(0, 60000);
        const lastNewline = trimmed.lastIndexOf('\n');
        if (lastNewline > 50000) trimmed = trimmed.slice(0, lastNewline);
        specContent = trimmed;

        console.log('Spec content length after fetch:', specContent.length);
        console.log('Spec content preview:', specContent.slice(0, 300));
      } catch (fetchErr: any) {
        return NextResponse.json({ error: `URL fetch failed: ${fetchErr.message}` }, { status: 400 });
      }
    } else {
      specContent = spec_source.slice(0, 60000);
    }

    // Step 2 — build prompt and call Gemini Pro
    const { systemPrompt, userPrompt } = getExtractionPrompt(exchange_name, specContent, asset_classes);

    let rawText = '';
    try {
      const result = await extractionModel.generateContent([
        { text: systemPrompt + '\n\n' + userPrompt }
      ]);
      rawText = result.response.text();
    } catch (geminiError) {
      console.error('Gemini API call failed:', geminiError);
      return NextResponse.json(
        { error: 'Gemini extraction failed', details: String(geminiError) },
        { status: 500 }
      );
    }

    console.log('Gemini raw response length:', rawText.length);
    console.log('Gemini raw response preview:', rawText.slice(0, 500));

    // Step 3 — parse and validate JSON
    let extraction: ExtractionResult;
    try {
      // Clean up markdown markers
      let cleanText = rawText.replace(/```json\n?|```\n?/g, '').trim();
      
      // Robustly extract just the JSON
      const match = cleanText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON structure found in response');
      
      let parsed = JSON.parse(match[0]);
      
      // Standardize schema
      if (Array.isArray(parsed)) {
        // If Gemini hallucinates an outer array
        extraction = { checks: parsed } as ExtractionResult;
      } else {
        extraction = parsed as ExtractionResult;
        // Fix "results" vs "checks" hallucination
        if (!extraction.checks && (parsed as any).results) {
            extraction.checks = (parsed as any).results;
        }
      }
      
      if (!extraction.checks) {
        extraction.checks = [];
      }
      
    } catch (parseError) {
      console.error('JSON parse failed. Raw response:', rawText.slice(0, 2000));
      return NextResponse.json(
        { 
          error: 'JSON parse failed', 
          rawPreview: rawText.slice(0, 1000),
          details: String(parseError)
        },
        { status: 500 }
      );
    }

    // Ensure we have the basic required fields
    if (!extraction.exchange_name) extraction.exchange_name = exchange_name || 'Unknown Exchange';
    if (!extraction.spec_source) extraction.spec_source = spec_source || '';
    if (!extraction.extraction_date) extraction.extraction_date = new Date().toISOString();
    
    // Attach slug for downstream passing
    (extraction as any).exchange_slug = exchange_slug;

    return NextResponse.json(extraction);
  } catch (error: any) {
    console.error('Ingest API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
