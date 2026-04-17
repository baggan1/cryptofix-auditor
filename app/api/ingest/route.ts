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
        let baseUrl = new URL(spec_source);
        let links: string[] = [];
        
        // Simple regex to find hrefs
        const regex = /<a[^>]+href="([^"]+)"/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
          let link = match[1];
          if (!link.startsWith('http')) {
            try {
               link = new URL(link, baseUrl).href;
            } catch { continue; }
          }
          if (link.includes(baseUrl.hostname) && !links.includes(link) && link !== spec_source) {
            links.push(link);
          }
        }

        // Fetch up to 4 additional pages
        const pagesToFetch = links.slice(0, 4);
        let combinedHtml = html;
        for (const link of pagesToFetch) {
           try {
             const subHtml = await fetchPage(link);
             combinedHtml += '\n\n' + subHtml;
           } catch {
             // Ignore sub-page fetch errors
           }
        }

        specContent = combinedHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        specContent = specContent.slice(0, 80000); // Cap at 80k chars
      } catch (fetchErr: any) {
        return NextResponse.json({ error: `URL fetch failed: ${fetchErr.message}` }, { status: 400 });
      }
    } else {
      specContent = spec_source.slice(0, 80000);
    }

    // Step 2 — build prompt and call Gemini Pro
    const { systemPrompt, userPrompt } = getExtractionPrompt(exchange_name, specContent, asset_classes);

    let result;
    try {
      result = await extractionModel.generateContent([
        { text: systemPrompt + '\n\n' + userPrompt }
      ]);
    } catch (geminiError: any) {
      if (geminiError.status === 429 || geminiError.message?.includes('429')) {
        return NextResponse.json({ error: 'Audit quota reached, try again in a few minutes' }, { status: 429 });
      }
      throw geminiError;
    }

    const responseText = result.response.text();

    // Step 3 — parse and validate JSON
    let extraction: ExtractionResult;
    try {
      const clean = responseText.replace(/```json|```/g, '').trim();
      extraction = JSON.parse(clean);
    } catch (parseError) {
      console.error('JSON Parse Error. Raw response:', responseText);
      return NextResponse.json({ error: 'Failed to parse JSON', rawResponse: responseText }, { status: 500 });
    }

    // Ensure we have the basic required fields
    if (!extraction.exchange_name) extraction.exchange_name = exchange_name;
    if (!extraction.spec_source) extraction.spec_source = spec_source;
    if (!extraction.extraction_date) extraction.extraction_date = new Date().toISOString();
    
    // Attach slug for downstream passing
    (extraction as any).exchange_slug = exchange_slug;

    return NextResponse.json(extraction);
  } catch (error: any) {
    console.error('Ingest API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
