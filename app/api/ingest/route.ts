import { NextRequest, NextResponse } from 'next/server';
import { extractionModel, extractionModelLarge } from '@/lib/gemini';
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

function prepareSpecContent(raw: string, isPasted: boolean): string {
  // For pasted content, try to keep message type sections
  // and remove repeated boilerplate
  let content = raw;

  // Remove HTML artifacts if any slipped through
  content = content.replace(/<[^>]+>/g, ' ').replace(/\s{3,}/g, '\n').trim();

  // Cap at 50K for pasted content (leaves more room for output)
  const CAP = isPasted ? 50000 : 70000;

  if (content.length <= CAP) return content;

  // Try to cut at a natural section boundary
  const truncated = content.slice(0, CAP);
  const lastSection = Math.max(
    truncated.lastIndexOf('\n## '),
    truncated.lastIndexOf('\n# '),
    truncated.lastIndexOf('\n35='),
    truncated.lastIndexOf('\nMsgType'),
  );

  return lastSection > CAP * 0.8
    ? truncated.slice(0, lastSection)
    : truncated;
}

function addStructureMarkers(text: string, specUrl: string): string {
  // Add a header so Gemini knows what it's reading
  let domain = 'Manual Upload';
  try {
    if (specUrl.startsWith('http')) {
      domain = new URL(specUrl).hostname;
    } else {
      domain = specUrl;
    }
  } catch (e) {
    domain = specUrl;
  }

  const header = `
=== FIX API SPECIFICATION ===
Source: ${specUrl}
Domain: ${domain}
Instructions: The following is a FIX protocol specification document.
Each section describes a FIX message type. Tags listed under a message
type are supported by that message. A tag present anywhere in the
document should be scored full_credit unless explicitly restricted.
=== SPECIFICATION CONTENT FOLLOWS ===

`;
  return header + text;
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
      specContent = prepareSpecContent(spec_source, true);
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
            'https://docs.cdp.coinbase.com/international-exchange/fix-api/common-components',
          ],
          'docs.cdp.coinbase.com/exchange': [
            'https://docs.cdp.coinbase.com/exchange/fix-api/connectivity',
            'https://docs.cdp.coinbase.com/exchange/fix-api/drop-copy',
          ],
          'docs.kraken.com': [
            'https://docs.kraken.com/api/docs/fix-api/er-fix',
            'https://docs.kraken.com/api/docs/fix-api/session-fix',
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

        specContent = prepareSpecContent(specContent, false);

        console.log('Spec content length after fetch:', specContent.length);
        console.log('Spec content preview:', specContent.slice(0, 300));
        
        if (specContent.length < 1500) {
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
      specContent = prepareSpecContent(spec_source, false);
    }

    // Apply structure markers to help Gemini understand the context
    specContent = addStructureMarkers(specContent, is_pasted ? `Pasted content for ${exchange_name}` : spec_source);
    console.log('Final content sent to Gemini (first 800 chars):', specContent.slice(0, 800));

    // Step 2 — build prompt and call Gemini Pro
    const { systemPrompt, userPrompt } = getExtractionPrompt(exchange_name, specContent, asset_classes);

    let rawText = '';
    try {
      const model = specContent.length > 30000
        ? extractionModelLarge
        : extractionModel;

      const result = await model.generateContent([
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
        // Fix "results" vs "checks" hallucination - cast to any for legacy check
        const extAny = extraction as any;
        if (extAny.results && !extraction.checks) {
          extraction.checks = extAny.results.map((r: any) => ({
            ...r,
            status: r.status ?? r.determination ?? 'no_credit',
          }));
          delete extAny.results;
        }
        // Also normalize any "determination" → "status" in checks array
        if (extraction.checks) {
          extraction.checks = (extraction.checks as any[]).map((c: any) => ({
            ...c,
            status: c.status ?? c.determination ?? 'no_credit',
          }));
        }
      }
      
      if (!extraction.checks) {
        extraction.checks = [];
      }
      
      // After parsing extraction JSON, ensure all checks are present
      const rubric = require('../../../cryptofix_master_rubric.json');
      const EXPECTED_CHECK_IDS = rubric.tiers.flatMap((t: any) => t.checks.map((c: any) => c.id));

      const returnedIds = new Set(extraction.checks?.map((c: any) => c.check_id) ?? []);
      const missingIds = EXPECTED_CHECK_IDS.filter((id: string) => !returnedIds.has(id));

      if (missingIds.length > 0) {
        console.warn(`Missing ${missingIds.length} checks from extraction:`, missingIds);
        const missingChecks = missingIds.map((id: string) => {
          const rubricCheck = rubric.tiers.flatMap((t: any) => t.checks).find((c: any) => c.id === id);
          return {
            check_id: id,
            message_type: rubricCheck?.message_type || '',
            message_name: rubricCheck?.message_name || '',
            level: rubricCheck?.level || 'tag',
            fix_tag: rubricCheck?.fix_tag || null,
            field_name: rubricCheck?.field_name || id,
            status: 'no_credit' as const,
            points_available: rubricCheck?.weight || 0,
            evidence: null,
            asset_class_limitation: null,
            custom_tag_notes: 'Not returned by extraction'
          };
        });
        extraction.checks = [...(extraction.checks ?? []), ...(missingChecks as any[])];
      }
      
    } catch (parseError) {
      console.error('JSON parse failed, attempting recovery...');
      try {
        const checksStart = rawText.indexOf('"checks"');
        if (checksStart > 0) {
          let lastComplete = rawText.lastIndexOf('},\n    {');
          if (lastComplete === -1) lastComplete = rawText.lastIndexOf('},\n  {');
          if (lastComplete === -1) lastComplete = rawText.lastIndexOf('}');

          if (lastComplete > checksStart) {
            const partial = rawText.slice(0, lastComplete + 1) + '\n  ]\n}';
            try {
              extraction = JSON.parse(partial.replace(/```json\n?|```\n?/g, '').trim());
              console.warn(`Recovered partial extraction with ${extraction.checks?.length ?? 0} checks`);
            } catch {
              throw parseError;
            }
          } else {
            throw parseError;
          }
        } else {
          throw parseError;
        }
      } catch {
        return NextResponse.json({
          error: 'JSON parse failed',
          rawPreview: rawText.slice(0, 500),
          hint: 'Try pasting a smaller section of the spec (under 50,000 characters). Focus on the order entry messages section.',
          details: String(parseError)
        }, { status: 500 });
      }
    }

    // Ensure we have the basic required fields
    if (!extraction.exchange_name) extraction.exchange_name = exchange_name || 'Unknown Exchange';
    if (!extraction.spec_source) extraction.spec_source = spec_source || '';
    if (!extraction.extraction_date) extraction.extraction_date = new Date().toISOString();
    
    // Attach slug for downstream passing
    (extraction as any).exchange_slug = exchange_slug;

    const fullCredit = extraction.checks.filter((c: any) => c.status === 'full_credit').length;
    const partialCredit = extraction.checks.filter((c: any) => c.status === 'partial_credit').length;
    const noCredit = extraction.checks.filter((c: any) => c.status === 'no_credit').length;
    const withEvidence = extraction.checks.filter((c: any) => c.evidence !== null).length;

    console.log(`Extraction quality: ${fullCredit} full / ${partialCredit} partial / ${noCredit} missing`);
    console.log(`Checks with evidence: ${withEvidence}/${extraction.checks.length}`);

    // Flag if too many are missing (likely a content quality issue)
    if (noCredit > 20) {
      console.warn('HIGH MISS RATE: >20 checks missing. Spec content may be low quality.');
    }

    return NextResponse.json(extraction);
  } catch (error: any) {
    console.error('Ingest API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
