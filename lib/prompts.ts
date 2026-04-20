import rubric from '../cryptofix_master_rubric.json';

export function getExtractionPrompt(exchangeName: string, specContent: string, assetClasses: string) {
  const systemPrompt = `${rubric.ai_extraction_prompt.content}
    
    CRITICAL SCORING RULES:
    1. For message-level checks (check_id ends in _000):
       full_credit    = message type is explicitly documented with a tag table
       partial_credit = message is mentioned but documentation is incomplete
       no_credit      = message is absent
    
    2. For tag-level checks (check_id contains a tag number):
       full_credit    = tag explicitly listed in that specific message type's table
       partial_credit = tag present but conditional, restricted, or via custom tag
       no_credit      = tag absent from that message type's documentation
    
    3. IMPORTANT: Score each tag WITHIN its message type context. 
       Tag 55 (Symbol) may be present in 35=D but not 35=F — score each separately.
       Do not assume a tag present in one message is present in another.
    
    4. Evidence must be a DIRECT quote or close paraphrase of text that
       mentions the specific tag number or field name being scored.
    
    Respond with a JSON object using EXACTLY these field names:
    {
      "exchange_name": "string",
      "spec_source": "string", 
      "asset_classes_audited": ["string"],
      "extraction_date": "string (ISO 8601 date only)",
      "checks": [
        {
          "check_id": "string (e.g. T1_D_011)",
          "message_type": "string",
          "message_name": "string",
          "level": "message | tag",
          "tag_number": number | null,
          "tag_name": "string",
          "status": "full_credit | partial_credit | no_credit",
          "evidence": "string or null",
          "asset_class_limitation": "string or null"
        }
      ]
    }

    EVERY check_id from the rubric must appear exactly once.
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
