import rubric from '../cryptofix_master_rubric.json';

export function getExtractionPrompt(exchangeName: string, specContent: string, assetClasses: string) {
  const systemPrompt = `${rubric.ai_extraction_prompt.content}
    
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
          "points_available": "number",
          "evidence": "string or null",
          "asset_class_limitation": "string or null",
          "custom_tag_notes": "string or null"
        }
      ]
    }

    CRITICAL: Use "checks" not "results". Use "status" not "determination".
    Every check_id from T1_001 through T5_005 must appear exactly once.
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
