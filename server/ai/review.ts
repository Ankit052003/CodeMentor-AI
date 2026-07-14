import { z } from "zod";

export type ReviewIssueDraft = {
  category: "BUG" | "STYLE" | "COMPLEXITY" | "SECURITY" | "BEST_PRACTICE";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lineStart?: number;
  lineEnd?: number;
  title: string;
  explanation: string;
  suggestion: string;
};

export type GeneratedReview = {
  summary: string;
  overallScore: number;
  correctnessScore: number;
  readabilityScore: number;
  complexityScore: number;
  securityScore: number;
  issues: ReviewIssueDraft[];
  suggestedCode: string;
  beginnerExplanation: string;
  followUpExercises: Array<{
    title: string;
    description: string;
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    expectedConcept: string;
  }>;
  securityWarnings: string[];
};

const reviewIssueSchema = z.object({
  category: z.enum(["BUG", "STYLE", "COMPLEXITY", "SECURITY", "BEST_PRACTICE"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  lineStart: z.number().int().positive().optional(),
  lineEnd: z.number().int().positive().optional(),
  title: z.string().min(1),
  explanation: z.string().min(1),
  suggestion: z.string().min(1)
});

export const reviewOutputSchema = z.object({
  summary: z.string().min(1),
  overallScore: z.number().int().min(0).max(100),
  correctnessScore: z.number().int().min(0).max(100),
  readabilityScore: z.number().int().min(0).max(100),
  complexityScore: z.number().int().min(0).max(100),
  securityScore: z.number().int().min(0).max(100),
  issues: z.array(reviewIssueSchema),
  suggestedCode: z.string().min(1),
  beginnerExplanation: z.string().min(1),
  followUpExercises: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
      expectedConcept: z.string().min(1)
    })
  ),
  securityWarnings: z.array(z.string().min(1))
});

export const reviewPromptTemplate = `You are a code review assistant for beginner programmers.
Return strictly valid JSON with these keys:
summary, overallScore, correctnessScore, readabilityScore, complexityScore, securityScore, issues, suggestedCode, beginnerExplanation, followUpExercises, securityWarnings.

Rules:
- Be specific and beginner-friendly.
- Do not execute code.
- Warn about possible secrets or unsafe patterns.
- Keep suggestions actionable.
- Include line references when you can infer them.
- The issues array must contain categorized review items.`;

const secretPatterns = [
  /(?:api[_-]?key|secret|token|password|passwd)\s*[:=]\s*['"][^'"]{8,}['"]/i,
  /(?:AKIA|ASIA)[0-9A-Z]{16}/,
  /(?:xox[baprs]-[0-9A-Za-z-]{10,})/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
];

function detectSecrets(source: string) {
  return secretPatterns
    .filter((pattern) => pattern.test(source))
    .map((pattern) => {
      if (pattern.source.includes("PRIVATE KEY")) return "Possible private key material detected.";
      if (pattern.source.includes("AKIA")) return "Possible AWS access key detected.";
      if (pattern.source.includes("xox")) return "Possible Slack token detected.";
      return "Possible credential-like string detected.";
    });
}

function inferLanguageSpecificGuidance(language: string, source: string): GeneratedReview {
  const lines = source.split(/\r?\n/);
  const lineCount = Math.max(lines.length, 1);
  const securityWarnings = detectSecrets(source);
  const issues: ReviewIssueDraft[] = [];

  let correctnessScore = 85;
  let readabilityScore = 84;
  let complexityScore = 86;
  let securityScore = 95;

  const hasEmptyArrayGuard = /length\s*===\s*0|length\s*===\s*1|if\s*\(!?\w+\.length\)/i.test(source);
  const hasInitialElement = /\[0\]|first\s*=|initial/i.test(source);
  const hasNestedLoops = /for\s*\(.*\)\s*\{[\s\S]*for\s*\(.*\)/m.test(source) || /while\s*\(.*\)\s*\{[\s\S]*while\s*\(.*\)/m.test(source);
  const usesMagicNumbers = /[^\w](?:0|1|10|50|100)[^\w]/.test(source);
  const hasLongFunction = lineCount > 40;

  if (/return\s+0;/.test(source) && /max|min|largest|smallest/i.test(source)) {
    correctnessScore -= 14;
    issues.push({
      category: "BUG",
      severity: "HIGH",
      lineStart: lines.findIndex((line) => /return\s+0;/.test(line)) + 1 || undefined,
      title: "Initialization can be wrong for negative values",
      explanation: "Initializing an extremum to 0 breaks cases where all inputs are below 0.",
      suggestion: "Initialize from the first array element after checking for an empty input."
    });
  }

  if (!hasEmptyArrayGuard && /(max|min|sum|filter|find)/i.test(source)) {
    correctnessScore -= 8;
    issues.push({
      category: "BEST_PRACTICE",
      severity: "MEDIUM",
      title: "Empty-input behavior is undefined",
      explanation: "The code does not clearly define what happens when the input collection is empty.",
      suggestion: "Add an early return or a clear error for empty input."
    });
  }

  if (hasNestedLoops) {
    complexityScore -= 18;
    issues.push({
      category: "COMPLEXITY",
      severity: "MEDIUM",
      title: "Nested loops may be expensive",
      explanation: "Nested loops often create quadratic behavior when a single pass or a lookup would work.",
      suggestion: "Check whether one loop can be replaced with a map, set, or precomputed value."
    });
  }

  if (usesMagicNumbers) {
    readabilityScore -= 6;
    issues.push({
      category: "STYLE",
      severity: "LOW",
      title: "Magic numbers reduce clarity",
      explanation: "Repeated numeric literals make it harder to understand the intent of the code.",
      suggestion: "Extract important numbers into named constants with clear meanings."
    });
  }

  if (hasLongFunction) {
    readabilityScore -= 6;
    issues.push({
      category: "STYLE",
      severity: "MEDIUM",
      title: "Function is doing too much",
      explanation: "Long functions are harder to scan, test, and reason about.",
      suggestion: "Split the logic into smaller helper functions with single responsibilities."
    });
  }

  if (/eval\(|innerHTML|document\.write|dangerouslySetInnerHTML/.test(source)) {
    securityScore -= 22;
    issues.push({
      category: "SECURITY",
      severity: "HIGH",
      title: "Potentially unsafe browser or code execution pattern",
      explanation: "This pattern can expose users to script injection or unsafe execution.",
      suggestion: "Avoid dynamic code execution and sanitize any user-controlled HTML or script input."
    });
  }

  if (securityWarnings.length > 0) {
    securityScore -= 20;
    issues.push({
      category: "SECURITY",
      severity: "CRITICAL",
      title: "Possible secret detected in code",
      explanation: securityWarnings[0],
      suggestion: "Remove credentials from the code and rotate any real secret immediately."
    });
  }

  if (language === "TYPESCRIPT" && !/:\s*\w+/.test(source)) {
    readabilityScore -= 5;
    issues.push({
      category: "BEST_PRACTICE",
      severity: "LOW",
      title: "TypeScript types could be clearer",
      explanation: "The code does not take advantage of obvious type annotations in several places.",
      suggestion: "Add explicit parameter and return types where they improve readability."
    });
  }

  if (language === "PYTHON" && /print\(/.test(source) && !/return\s+/.test(source)) {
    correctnessScore -= 6;
    issues.push({
      category: "BEST_PRACTICE",
      severity: "LOW",
      title: "Function may be side-effect only",
      explanation: "Printing instead of returning values makes the function harder to test and reuse.",
      suggestion: "Return the computed value and let the caller decide how to display it."
    });
  }

  if (!hasInitialElement && /max|min|largest|smallest/i.test(source)) {
    correctnessScore -= 7;
    issues.push({
      category: "BUG",
      severity: "MEDIUM",
      title: "Consider initializing from the first value",
      explanation: "Algorithms that search for extremes usually need a known baseline value.",
      suggestion: "Set the baseline to the first element after validating the input is not empty."
    });
  }

  correctnessScore = Math.max(correctnessScore, 0);
  readabilityScore = Math.max(readabilityScore, 0);
  complexityScore = Math.max(complexityScore, 0);
  securityScore = Math.max(securityScore, 0);

  const overallScore = Math.round((correctnessScore + readabilityScore + complexityScore + securityScore) / 4);

  const suggestedCode = language === "PYTHON"
    ? `def find_max(numbers):\n    if not numbers:\n        raise ValueError("numbers must not be empty")\n\n    max_value = numbers[0]\n    for number in numbers[1:]:\n        if number > max_value:\n            max_value = number\n\n    return max_value`
    : `function findMax(numbers) {\n  if (numbers.length === 0) {\n    throw new Error("numbers must not be empty");\n  }\n\n  let maxValue = numbers[0];\n  for (const number of numbers.slice(1)) {\n    if (number > maxValue) {\n      maxValue = number;\n    }\n  }\n\n  return maxValue;\n}`;

  const beginnerExplanation = "Focus on one bug at a time: start with a safe initial value, handle empty input explicitly, then simplify the rest of the loop. That makes the code more reliable and easier to reason about.";

  const followUpExercises = [
    {
      title: "Handle empty input clearly",
      description: "Update the function so empty arrays are handled in a predictable way.",
      difficulty: "BEGINNER" as const,
      expectedConcept: "Edge cases"
    },
    {
      title: "Compare against the first element",
      description: "Rewrite the function so it works for negative values too.",
      difficulty: "BEGINNER" as const,
      expectedConcept: "Initialization"
    }
  ];

  const summary = issues.length > 0
    ? "This solution is close, but it has edge-case and clarity issues that should be fixed before the code is considered reliable."
    : "This is a solid beginner solution with a few opportunities to improve clarity and robustness.";

  return {
    summary,
    overallScore,
    correctnessScore,
    readabilityScore,
    complexityScore,
    securityScore,
    issues,
    suggestedCode,
    beginnerExplanation,
    followUpExercises,
    securityWarnings
  };
}

export function analyzeSubmissionCode(language: string, sourceCode: string) {
  const localized = inferLanguageSpecificGuidance(language, sourceCode);

  return reviewOutputSchema.parse(localized);
}
