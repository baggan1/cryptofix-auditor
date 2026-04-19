import { NextRequest, NextResponse } from 'next/server';
import { extractionModel } from '@/lib/gemini';
import { getExtractionPrompt } from '@/lib/prompts';
import { ExtractionResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

function extractTextFromHTML(html: string): string {
  return html
    // Remove all script blocks including content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    // Remove all style blocks
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    // Remove nav, header, footer elements
    .replace(/<(nav|header|footer|aside)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, ' ')
    // Convert table structure to readable text
    .replace(/<tr[^>]*>/gi, '\n')
    .replace(/<t[dh][^>]*>/gi, ' | ')
    .replace(/<\/tr>/gi, '')
    // Convert list items
    .replace(/<li[^>]*>/gi, '\n- ')
    // Convert headings
    .replace(/<h[1-6][^>]*>/gi, '\n\n## ')
    // Remove all remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    // Clean up whitespace
    .replace(/\s{3,}/g, '\n\n')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { exchange_name, spec_source, asset_classes = 'spot', is_pasted = false } = await req.json();

    if (!exchange_name || !spec_source) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const exchange_slug = exchange_name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

    // Step 1 — fetch spec content if URL provided
    let specContent = '';
    if (is_pasted) {
      specContent = spec_source.slice(0, 60000);
    } else if (spec_source.startsWith('http')) {
      try {
        const fetchPage = async (url: string) => {
          const res = await fetch(url, { 
            headers: { 
              'User-Agent': 'Mozilla/5.0 (compatible; CryptoFIX-Auditor/1.0)',
              'Accept': 'text/html,application/xhtml+xml',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: AbortSignal.timeout(15000)
          });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          return res.text();
        };

        let html = await fetchPage(spec_source);
        specContent = extractTextFromHTML(html);

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
                const subClean = extractTextFromHTML(subHtml);
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
        
        if (specContent.length < 2000) {
          return NextResponse.json({
            error: 'Spec content too short after extraction',
            details: `Only ${specContent.length} chars extracted. This page may require JavaScript rendering. Try pasting the spec content directly instead of a URL, or use a different URL that serves static HTML.`,
            hint: 'For Coinbase INTX, try: https://docs.cdp.coinbase.com/international-exchange/fix-api/order-entry-messages — if this fails, paste the page text directly'
          }, { status: 422 });
        }
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
        if (extraction.results && !extraction.checks) {
          extraction.checks = extraction.results.map((r: any) => ({
            ...r,
            status: r.status ?? r.determination ?? 'no_credit',
          }));
          delete (extraction as any).results;
        }
        // Also normalize any "determination" → "status" in checks array
        if (extraction.checks) {
          extraction.checks = extraction.checks.map((c: any) => ({
            ...c,
            status: c.status ?? c.determination ?? 'no_credit',
          }));
        }
      }
      
      if (!extraction.checks) {
        extraction.checks = [];
      }
      
      // After parsing extraction JSON, ensure all 27 checks are present
      const EXPECTED_CHECK_IDS = [
        'T1_001','T1_002','T1_003','T1_004','T1_005','T1_006','T1_007','T1_008','T1_009',
        'T2_001','T2_002','T2_003','T2_004','T2_005','T2_006','T2_007','T2_008',
        'T3_001','T3_002','T3_003','T3_004','T3_005','T3_006',
        'T4_001','T4_002','T4_003','T4_004'
      ];

      const returnedIds = new Set(extraction.checks?.map((c: any) => c.check_id) ?? []);
      const missingIds = EXPECTED_CHECK_IDS.filter(id => !returnedIds.has(id));

      if (missingIds.length > 0) {
        console.warn(`Missing ${missingIds.length} checks from extraction:`, missingIds);
        const missingChecks = missingIds.map(id => ({
          check_id: id,
          fix_tag: '',
          field_name: id,
          status: 'no_credit',
          points_available: 0,
          evidence: null,
          asset_class_limitation: null,
          custom_tag_notes: 'Not returned by extraction — spec may not cover this field'
        }));
        extraction.checks = [...(extraction.checks ?? []), ...missingChecks];
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
