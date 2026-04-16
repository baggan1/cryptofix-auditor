import rubric from '../cryptofix_master_rubric.json';

export function getExtractionPrompt(exchangeName: string, specContent: string, assetClasses: string) {
  const systemPrompt = `${rubric.ai_extraction_prompt.content}
    
    IMPORTANT: Respond ONLY with valid JSON matching the output_schema exactly.
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
