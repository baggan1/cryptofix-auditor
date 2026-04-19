import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use Pro for extraction (multi-doc technical analysis, 32 checks, evidence strings)
export const extractionModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.1,  // Low temperature for consistent structured extraction
    maxOutputTokens: 16384,
  },
});

// Use Flash for narrative generation (speed acceptable, lower cost)
export const narrativeModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.3,
    maxOutputTokens: 4096,
  },
});
