import rubric from '../cryptofix_master_rubric.json';

export function getExtractionPrompt(exchangeName: string, specContent: string, assetClasses: string) {
  const systemPrompt = `${rubric.ai_extraction_prompt.content}
    
    CRITICAL SCORING RULES:
    1. A FIX tag is "full_credit" if it appears ANYWHERE in the specification
       with its correct tag number or message type. You do not need to find it
       in every message — finding it once is sufficient.
    2. Evidence must be a DIRECT quote or close paraphrase of text that
       mentions the specific tag number or field name being scored. Do not
       use evidence from an unrelated field.
    3. If you cannot find specific evidence for a tag, set status to
       "no_credit" and evidence to null. Do NOT use evidence from other tags.
    4. Tag 59 (TimeInForce) — look for "TimeInForce", "GTC", "IOC", "FOK",
       "GTT", "Good Till", or "Fill or Kill" anywhere in the spec.
    5. Tag 35=G (OrderCancelReplaceRequest) — look for "35=G", 
       "OrderCancelReplaceRequest", "modify", "replace", or "cancel-replace".
    6. Tags 448/452 (Parties group) — look for "PartyID", "PartyRole",
       "NoPartyIDs", "453", "448", "452", "portfolio UUID", or "Client ID".
    7. For the Parties group (T4_001), if the spec shows PartyID (448) and
       PartyRole (452) being used for portfolio or account routing, that is
       PARTIAL_CREDIT minimum — the Parties group is implemented even if
       not used for VASP identification specifically.

    Respond with a JSON object using EXACTLY these field names:
    {
      "exchange_name": "string",
      "spec_source": "string", 
      "asset_classes_audited": ["string"],
      "extraction_date": "string (ISO 8601 date only, e.g. 2026-04-17)",
      "extractor_notes": "string",
      "checks": [
        {
          "check_id": "string (e.g. T1_001)",
          "fix_tag": "string",
          "field_name": "string", 
          "status": "full_credit OR partial_credit OR no_credit",
          "points_available": number,
          "evidence": "string or null",
          "asset_class_limitation": "string or null",
          "custom_tag_notes": "string or null"
        }
      ]
    }

    CRITICAL: Use "checks" not "results". Use "status" not "determination".
    Every check_id from T1_001 through T4_004 must appear exactly once.
    Do not invent check_ids. Do not skip any check_id.
    Do not include markdown fences, preamble, or explanation outside the JSON.`;

  const userPrompt = `Exchange: ${exchangeName}
Asset classes: ${assetClasses}
Extraction date: ${new Date().toISOString().split('T')[0]}

FIX API specification content:
${specContent}`;

  return { systemPrompt, userPrompt };
}

export function getRubric() {
  return rubric;
}
