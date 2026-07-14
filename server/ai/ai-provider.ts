import { GoogleGenerativeAI } from "@google/generative-ai";
import { analyzeSubmissionCode, reviewOutputSchema, reviewPromptTemplate } from "./review";
import type { GeneratedReview } from "./review";

const MAX_SOURCE_LENGTH = 20_000;
const MAX_RETRIES = 2;

/**
 * Call Gemini to generate a structured AI code review.
 * Falls back to the heuristic engine if the API key is missing or the call fails.
 */
export async function generateAIReview(
  language: string,
  sourceCode: string
): Promise<GeneratedReview> {
  if (sourceCode.length > MAX_SOURCE_LENGTH) {
    throw new Error(
      `Source code exceeds the maximum length of ${MAX_SOURCE_LENGTH} characters.`
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // No API key → use heuristic fallback
  if (!apiKey) {
    return analyzeSubmissionCode(language, sourceCode);
  }

  // Try Gemini with retries
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await callGemini(apiKey, language, sourceCode);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on non-transient errors
      if (lastError.message.includes("API key")) {
        break;
      }
    }
  }

  // All retries failed → fall back to heuristic engine
  console.warn(
    `Gemini API failed after ${MAX_RETRIES + 1} attempts, falling back to heuristic engine:`,
    lastError?.message
  );
  return analyzeSubmissionCode(language, sourceCode);
}

async function callGemini(
  apiKey: string,
  language: string,
  sourceCode: string
): Promise<GeneratedReview> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const prompt = `${reviewPromptTemplate}

Language: ${language}

Source code:
\`\`\`
${sourceCode}
\`\`\`

Return ONLY valid JSON matching this exact schema:
{
  "summary": "string",
  "overallScore": number (0-100),
  "correctnessScore": number (0-100),
  "readabilityScore": number (0-100),
  "complexityScore": number (0-100),
  "securityScore": number (0-100),
  "issues": [{ "category": "BUG"|"STYLE"|"COMPLEXITY"|"SECURITY"|"BEST_PRACTICE", "severity": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", "lineStart": number|null, "lineEnd": number|null, "title": "string", "explanation": "string", "suggestion": "string" }],
  "suggestedCode": "string",
  "beginnerExplanation": "string",
  "followUpExercises": [{ "title": "string", "description": "string", "difficulty": "BEGINNER"|"INTERMEDIATE"|"ADVANCED", "expectedConcept": "string" }],
  "securityWarnings": ["string"]
}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Parse the JSON response
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1].trim());
    } else {
      throw new Error("Failed to parse Gemini response as JSON");
    }
  }

  // Validate with Zod
  const validated = reviewOutputSchema.parse(parsed);
  return validated;
}
