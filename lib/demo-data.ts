export type DemoSubmissionSummary = {
  id: string;
  title: string;
  language: string;
  difficulty: string;
  status: string;
  topic: string;
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
  reviewScore: number | null;
  correctnessScore: number | null;
  readabilityScore: number | null;
  complexityScore: number | null;
  securityScore: number | null;
};

export const demoDashboardSubmissions: DemoSubmissionSummary[] = [
  {
    id: "demo-submission-reviewed",
    title: "Find the maximum number",
    language: "JAVASCRIPT",
    difficulty: "BEGINNER",
    status: "REVIEWED",
    topic: "Arrays",
    prompt: "Return the largest value from an array of numbers.",
    createdAt: new Date(),
    updatedAt: new Date(),
    reviewScore: 72,
    correctnessScore: 68,
    readabilityScore: 82,
    complexityScore: 90,
    securityScore: 95
  },
  {
    id: "demo-submission-draft",
    title: "Filter passing users",
    language: "TYPESCRIPT",
    difficulty: "BEGINNER",
    status: "DRAFT",
    topic: "Array filtering",
    prompt: "Return users whose score is above the passing threshold.",
    createdAt: new Date(),
    updatedAt: new Date(),
    reviewScore: null,
    correctnessScore: null,
    readabilityScore: null,
    complexityScore: null,
    securityScore: null
  }
];

export function getDemoDashboardData() {
  return demoDashboardSubmissions;
}

export function getDemoSubmissionDetail(id = "demo-submission-reviewed") {
  const base = demoDashboardSubmissions.find((submission) => submission.id === id) ?? demoDashboardSubmissions[0];

  return {
    id: base.id,
    studentId: "seed-student",
    student: {
      id: "seed-student",
      name: "Maya Student",
      email: "student@codementor.ai"
    },
    title: base.title,
    language: base.language,
    difficulty: base.difficulty,
    topic: base.topic,
    prompt: base.prompt,
    sourceCode: "function findMax(numbers) {\n  let max = 0;\n  for (let i = 0; i < numbers.length; i++) {\n    if (numbers[i] > max) {\n      max = numbers[i];\n    }\n  }\n  return max;\n}",
    sanitizedSourceCode: "function findMax(numbers) {\n  let max = 0;\n  for (let i = 0; i < numbers.length; i++) {\n    if (numbers[i] > max) {\n      max = numbers[i];\n    }\n  }\n  return max;\n}",
    status: base.status,
    aiReview: base.reviewScore === null ? null : {
      id: "demo-review",
      submissionId: base.id,
      summary: "The solution works for positive numbers but fails when all values are negative.",
      overallScore: base.reviewScore,
      correctnessScore: base.correctnessScore,
      readabilityScore: base.readabilityScore,
      complexityScore: base.complexityScore,
      securityScore: base.securityScore,
      verificationStatus: "APPROVED",
      createdAt: new Date(),
      issues: [
        {
          id: "demo-issue-1",
          reviewId: "demo-review",
          category: "BUG",
          severity: "HIGH",
          lineStart: 2,
          lineEnd: 2,
          title: "Fails for negative numbers",
          explanation: "Initializing max at 0 gives the wrong answer when every value is negative.",
          suggestion: "Initialize max from the first array element after checking for empty input."
        }
      ]
    },
    progressEvents: [
      {
        id: "demo-progress-reflection",
        eventType: "REVISION_CREATED",
        createdAt: new Date(),
        metadata: {
          reflection: "I learned to initialize the maximum value from the first element instead of using 0."
        }
      },
      {
        id: "demo-progress-exercise",
        eventType: "EXERCISE_COMPLETED",
        createdAt: new Date(),
        metadata: {
          exerciseId: "demo-exercise-1",
          reflection: "I tested the empty-array case and the negative numbers case."
        }
      }
    ],
    mentorComments: [
      {
        id: "demo-comment-1",
        body: "The AI review is accurate. Focus on the initialization bug first."
      }
    ],
    exercises: [
      {
        id: "demo-exercise-1",
        title: "Handle negative and empty arrays",
        description: "Rewrite findMax so it handles negative numbers and explicitly handles an empty array."
      }
    ],
    revisions: [
      {
        id: "demo-revision-1",
        changeSummary: "Initialize from the first element and add empty-array handling.",
        createdAt: new Date(),
        sourceCode: "function findMax(numbers) {\n  if (numbers.length === 0) {\n    throw new Error('numbers must not be empty');\n  }\n\n  let max = numbers[0];\n  for (let i = 1; i < numbers.length; i++) {\n    if (numbers[i] > max) {\n      max = numbers[i];\n    }\n  }\n  return max;\n}"
      }
    ]
  };
}

export function getDemoMentorDashboardData() {
  return {
    assignments: [
      {
        id: "demo-assignment-1",
        student: {
          id: "seed-student",
          name: "Maya Student",
          email: "student@codementor.ai",
          studentProfile: {
            skillLevel: "BEGINNER"
          },
          submissions: demoDashboardSubmissions.map((submission) => ({
            id: submission.id,
            title: submission.title,
            status: submission.status,
            topic: submission.topic,
            createdAt: submission.createdAt,
            aiReview: submission.reviewScore === null ? null : {
              verificationStatus: "APPROVED"
            }
          }))
        }
      }
    ]
  };
}

export function getDemoMentorStudentData() {
  return {
    id: "seed-student",
    name: "Maya Student",
    email: "student@codementor.ai",
    studentProfile: {
      skillLevel: "BEGINNER",
      learningGoals: ["Write clearer functions", "Handle edge cases", "Understand complexity"]
    },
    submissions: getDemoDashboardData().map((submission) => ({
      id: submission.id,
      title: submission.title,
      language: submission.language,
      topic: submission.topic,
      status: submission.status,
      aiReview: submission.reviewScore === null ? null : { overallScore: submission.reviewScore, issues: [] },
      revisions: []
    })),
    progressEvents: [
      {
        id: "demo-progress-1",
        eventType: "AI_REVIEW_CREATED",
        createdAt: new Date()
      }
    ]
  };
}
