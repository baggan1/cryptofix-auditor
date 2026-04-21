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
    
    5. TIER 5 CRITICAL DISAMBIGUATION RULES:
       T5_003 (SecurityType=DIGITAL, tag 167):
         - full_credit ONLY if the spec explicitly documents SecurityType(167)
           with the value "DIGITAL" as defined by ISO 24165
         - Do NOT score full_credit just because tag 167 appears in the spec
           with values like FUT, OPT, CS, SPOT, or any non-DIGITAL value
         - Example of correct full_credit: "SecurityType(167) = DIGITAL supported"
         - Example of INCORRECT full_credit: "SecurityType(167) = FUT (Futures)"
           This is standard FIX — NOT the DAWG DIGITAL extension
         - If tag 167 is present but only with FUT/OPT/CS/SPOT values: no_credit

       T5_005 (Symbol + SecAltIDGrp DTI pairs, tags 55 + 454/455/456):
         - full_credit ONLY if the spec documents the SecAltIDGrp repeating group
           (NoSecurityAltID tag 454, SecurityAltID tag 455, SecurityAltIDSource 456)
           being used WITH ISO 24165 DTI values alongside Symbol(55)
         - Do NOT score full_credit just because tag 55 Symbol appears in NOS
         - Do NOT score full_credit just because SecAltIDGrp appears anywhere
           without DTI-specific usage documented
         - Example of correct full_credit: "SecAltIDGrp used to carry DTI values
           (SecurityAltIDSource=Y) for each currency in the Symbol pair"
         - Example of INCORRECT full_credit: "Tag 55 Symbol required in NOS"
           This is standard FIX — NOT the DAWG DTI pair extension
         - If tag 55 is present without SecAltIDGrp DTI documentation: no_credit

       T5_001 (SecurityIDSource=Y, tags 22/456):
         - full_credit ONLY if SecurityIDSource value Y (or a new DTI-specific
           value) is explicitly documented for ISO 24165 identification
         - Do NOT score full_credit if SecurityIDSource appears with standard
           values like 1=CUSIP, 4=ISIN, 8=Exchange Symbol only

       T5_002 (CurrencyCodeSource, tags 2897/2899):
         - full_credit ONLY if tags 2897 (CurrencyCodeSource) or 2899
           (SettlCurrencyCodeSource) are explicitly documented
         - These are EP273 ratified tags — they have specific tag numbers
         - Do NOT score full_credit for generic currency field documentation

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
          "fix_tag": number | null,
          "field_name": "string",
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
