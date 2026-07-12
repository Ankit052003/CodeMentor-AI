import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../server/auth/password";
import { sanitizeCode, sanitizeText } from "../lib/sanitize";

const prisma = new PrismaClient();

const demoPassword = "Password123!";

async function seedUsers() {
  const passwordHash = await hashPassword(demoPassword);

  const student = await prisma.user.upsert({
    where: { email: "student@codementor.ai" },
    update: {
      name: "Maya Student",
      passwordHash,
      role: "STUDENT"
    },
    create: {
      id: "seed-student",
      name: "Maya Student",
      email: "student@codementor.ai",
      passwordHash,
      role: "STUDENT"
    }
  });

  const mentor = await prisma.user.upsert({
    where: { email: "mentor@codementor.ai" },
    update: {
      name: "Ravi Mentor",
      passwordHash,
      role: "MENTOR"
    },
    create: {
      id: "seed-mentor",
      name: "Ravi Mentor",
      email: "mentor@codementor.ai",
      passwordHash,
      role: "MENTOR"
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@codementor.ai" },
    update: {
      name: "Aisha Admin",
      passwordHash,
      role: "ADMIN"
    },
    create: {
      id: "seed-admin",
      name: "Aisha Admin",
      email: "admin@codementor.ai",
      passwordHash,
      role: "ADMIN"
    }
  });

  await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {
      skillLevel: "BEGINNER",
      preferredLanguages: ["JAVASCRIPT", "TYPESCRIPT", "PYTHON"],
      learningGoals: ["Write clearer functions", "Handle edge cases", "Understand complexity"]
    },
    create: {
      userId: student.id,
      skillLevel: "BEGINNER",
      preferredLanguages: ["JAVASCRIPT", "TYPESCRIPT", "PYTHON"],
      learningGoals: ["Write clearer functions", "Handle edge cases", "Understand complexity"]
    }
  });

  await prisma.mentorProfile.upsert({
    where: { userId: mentor.id },
    update: {
      expertise: ["JavaScript", "TypeScript", "Python", "Code review"],
      maxAssignedStudents: 12
    },
    create: {
      userId: mentor.id,
      expertise: ["JavaScript", "TypeScript", "Python", "Code review"],
      maxAssignedStudents: 12
    }
  });

  await prisma.mentorAssignment.upsert({
    where: {
      mentorId_studentId: {
        mentorId: mentor.id,
        studentId: student.id
      }
    },
    update: {},
    create: {
      id: "seed-assignment",
      mentorId: mentor.id,
      studentId: student.id
    }
  });

  return { student, mentor, admin };
}

async function seedReviewConfiguration() {
  const categories = [
    {
      code: "BUG" as const,
      name: "Bugs and correctness",
      description: "Logic errors, missing edge cases, and incorrect outputs."
    },
    {
      code: "STYLE" as const,
      name: "Readability and style",
      description: "Naming, formatting, structure, and clarity."
    },
    {
      code: "COMPLEXITY" as const,
      name: "Complexity and performance",
      description: "Algorithmic cost, unnecessary loops, and avoidable work."
    },
    {
      code: "SECURITY" as const,
      name: "Security",
      description: "Unsafe input handling, secret exposure, and risky patterns."
    },
    {
      code: "BEST_PRACTICE" as const,
      name: "Language best practices",
      description: "Idiomatic usage and maintainable language-specific guidance."
    }
  ];

  for (const category of categories) {
    const savedCategory = await prisma.reviewCategory.upsert({
      where: { code: category.code },
      update: {
        name: category.name,
        description: category.description,
        isActive: true
      },
      create: {
        code: category.code,
        name: category.name,
        description: category.description
      }
    });

    await prisma.reviewRubric.upsert({
      where: { id: `seed-rubric-${category.code.toLowerCase()}` },
      update: {
        categoryId: savedCategory.id,
        name: `${category.name} rubric`,
        guidance: `Score ${category.name.toLowerCase()} by explaining the issue, why it matters, and one concrete beginner-friendly improvement.`,
        minScore: 0,
        maxScore: 100,
        isActive: true
      },
      create: {
        id: `seed-rubric-${category.code.toLowerCase()}`,
        categoryId: savedCategory.id,
        name: `${category.name} rubric`,
        guidance: `Score ${category.name.toLowerCase()} by explaining the issue, why it matters, and one concrete beginner-friendly improvement.`,
        minScore: 0,
        maxScore: 100
      }
    });
  }
}

async function seedSubmissions(studentId: string, mentorId: string) {
  const reviewedCode = `function findMax(numbers) {
  let max = 0;
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] > max) {
      max = numbers[i];
    }
  }
  return max;
}`;

  const reviewedSubmission = await prisma.codeSubmission.upsert({
    where: { id: "seed-submission-reviewed" },
    update: {
      studentId,
      title: "Find the maximum number",
      language: "JAVASCRIPT",
      topic: "Arrays",
      difficulty: "BEGINNER",
      prompt: sanitizeText("Return the largest value from an array of numbers."),
      sourceCode: reviewedCode,
      sanitizedSourceCode: sanitizeCode(reviewedCode),
      status: "REVIEWED",
      submittedAt: new Date(),
      archivedAt: null
    },
    create: {
      id: "seed-submission-reviewed",
      studentId,
      title: "Find the maximum number",
      language: "JAVASCRIPT",
      topic: "Arrays",
      difficulty: "BEGINNER",
      prompt: sanitizeText("Return the largest value from an array of numbers."),
      sourceCode: reviewedCode,
      sanitizedSourceCode: sanitizeCode(reviewedCode),
      status: "REVIEWED",
      submittedAt: new Date()
    }
  });

  const review = await prisma.aiReview.upsert({
    where: { submissionId: reviewedSubmission.id },
    update: {
      summary:
        "The solution works for positive numbers but fails when all values are negative. Initializing max from the first array element would make the function safer.",
      overallScore: 72,
      correctnessScore: 68,
      readabilityScore: 82,
      complexityScore: 90,
      securityScore: 95,
      verificationStatus: "APPROVED"
    },
    create: {
      id: "seed-review-reviewed",
      submissionId: reviewedSubmission.id,
      summary:
        "The solution works for positive numbers but fails when all values are negative. Initializing max from the first array element would make the function safer.",
      overallScore: 72,
      correctnessScore: 68,
      readabilityScore: 82,
      complexityScore: 90,
      securityScore: 95,
      verificationStatus: "APPROVED"
    }
  });

  await prisma.reviewIssue.deleteMany({ where: { reviewId: review.id } });
  await prisma.reviewIssue.createMany({
    data: [
      {
        id: "seed-issue-negative-values",
        reviewId: review.id,
        category: "BUG",
        severity: "HIGH",
        lineStart: 2,
        lineEnd: 2,
        title: "Fails for arrays containing only negative numbers",
        explanation:
          "Starting max at 0 means the function returns 0 even when every input value is lower than 0.",
        suggestion:
          "Validate that the array is not empty, then initialize max with numbers[0] before the loop."
      },
      {
        id: "seed-issue-empty-array",
        reviewId: review.id,
        category: "BEST_PRACTICE",
        severity: "MEDIUM",
        lineStart: 1,
        lineEnd: 1,
        title: "Missing empty-array behavior",
        explanation:
          "The function does not define what should happen when numbers is empty, which makes callers guess.",
        suggestion:
          "Return null for an empty array or throw a clear error, then document that behavior."
      }
    ]
  });

  await prisma.exercise.upsert({
    where: { id: "seed-exercise-edge-cases" },
    update: {
      submissionId: reviewedSubmission.id,
      title: "Handle negative and empty arrays",
      description:
        "Rewrite findMax so it handles negative numbers and explicitly handles an empty array.",
      difficulty: "BEGINNER",
      expectedConcept: "Edge-case handling",
      status: "ASSIGNED"
    },
    create: {
      id: "seed-exercise-edge-cases",
      submissionId: reviewedSubmission.id,
      title: "Handle negative and empty arrays",
      description:
        "Rewrite findMax so it handles negative numbers and explicitly handles an empty array.",
      difficulty: "BEGINNER",
      expectedConcept: "Edge-case handling"
    }
  });

  await prisma.mentorComment.upsert({
    where: { id: "seed-comment-reviewed" },
    update: {
      submissionId: reviewedSubmission.id,
      mentorId,
      body: "The AI review is accurate. Focus on the initialization bug first because it changes the output."
    },
    create: {
      id: "seed-comment-reviewed",
      submissionId: reviewedSubmission.id,
      mentorId,
      body: "The AI review is accurate. Focus on the initialization bug first because it changes the output."
    }
  });

  const draftCode = `type User = {
  name: string;
  score: number;
};

export function passingUsers(users: User[]) {
  return users.filter((user) => user.score > 50);
}`;

  await prisma.codeSubmission.upsert({
    where: { id: "seed-submission-draft" },
    update: {
      studentId,
      title: "Filter passing users",
      language: "TYPESCRIPT",
      topic: "Array filtering",
      difficulty: "BEGINNER",
      prompt: sanitizeText("Return users whose score is above the passing threshold."),
      sourceCode: draftCode,
      sanitizedSourceCode: sanitizeCode(draftCode),
      status: "DRAFT",
      submittedAt: null,
      archivedAt: null
    },
    create: {
      id: "seed-submission-draft",
      studentId,
      title: "Filter passing users",
      language: "TYPESCRIPT",
      topic: "Array filtering",
      difficulty: "BEGINNER",
      prompt: sanitizeText("Return users whose score is above the passing threshold."),
      sourceCode: draftCode,
      sanitizedSourceCode: sanitizeCode(draftCode),
      status: "DRAFT"
    }
  });

  await prisma.progressEvent.createMany({
    data: [
      {
        id: "seed-progress-account",
        studentId,
        eventType: "ACCOUNT_CREATED",
        metadata: { source: "seed" }
      },
      {
        id: "seed-progress-reviewed",
        studentId,
        eventType: "AI_REVIEW_CREATED",
        metadata: { submissionId: reviewedSubmission.id, score: 72 }
      }
    ],
    skipDuplicates: true
  });
}

async function main() {
  const { student, mentor } = await seedUsers();
  await seedReviewConfiguration();
  await seedSubmissions(student.id, mentor.id);

  console.log("Seed complete.");
  console.log("Demo accounts:");
  console.log(`student@codementor.ai / ${demoPassword}`);
  console.log(`mentor@codementor.ai / ${demoPassword}`);
  console.log(`admin@codementor.ai / ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
