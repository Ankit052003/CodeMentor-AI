import { describe, it, expect } from "vitest";
import { reviewOutputSchema } from "../../server/ai/review";

describe("AI Review Schema Validation", () => {
  const validReview = {
    summary: "Good attempt but has edge case issues.",
    overallScore: 72,
    correctnessScore: 65,
    readabilityScore: 80,
    complexityScore: 75,
    securityScore: 90,
    issues: [
      {
        category: "BUG" as const,
        severity: "HIGH" as const,
        lineStart: 5,
        lineEnd: 8,
        title: "Missing empty input guard",
        explanation: "The function crashes on empty arrays.",
        suggestion: "Add an early return for empty input.",
      },
    ],
    suggestedCode: "function fixed() {}",
    beginnerExplanation: "Start by handling empty input first.",
    followUpExercises: [
      {
        title: "Handle edge cases",
        description: "Write a version that handles empty arrays.",
        difficulty: "BEGINNER" as const,
        expectedConcept: "Edge cases",
      },
    ],
    securityWarnings: [],
  };

  it("accepts a valid review output", () => {
    const result = reviewOutputSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = reviewOutputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects scores outside 0-100 range", () => {
    const result = reviewOutputSchema.safeParse({ ...validReview, overallScore: 150 });
    expect(result.success).toBe(false);
  });

  it("accepts review with minimal issues", () => {
    const minimal = { ...validReview, issues: [], securityWarnings: [] };
    const result = reviewOutputSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it("validates issue categories", () => {
    const badCategory = {
      ...validReview,
      issues: [{ ...validReview.issues[0], category: "INVALID" }],
    };
    const result = reviewOutputSchema.safeParse(badCategory);
    expect(result.success).toBe(false);
  });
});
