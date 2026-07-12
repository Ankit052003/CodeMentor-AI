# CodeMentor AI

CodeMentor AI is an AI-powered code review learning platform for beginner programmers. Students submit code, receive structured AI feedback, revise their solution, and track improvement over time. Mentors can review the same submissions, validate or override AI feedback, and guide students toward stronger programming habits.

The project is designed for the House of Edtech full-stack assignment. It avoids a basic CRUD pattern by focusing on an education workflow: code submission, categorized review, revision comparison, follow-up practice, mentor verification, and progress analytics.

## Problem

Beginner programmers often receive feedback that tells them what is wrong, but not why it is wrong or how to improve. CodeMentor AI turns code review into a guided learning loop by explaining issues, prioritizing fixes, and connecting feedback to follow-up practice.

## Target Users

| Role | Primary Goal |
| --- | --- |
| Student | Submit code, understand feedback, revise solutions, and track progress. |
| Mentor | Review assigned student work, verify AI feedback, add human guidance, and monitor improvement. |
| Admin | Manage users, mentor assignments, rubrics, categories, and platform-level quality. |

## MVP Features

- Secure authentication and role-based access for students, mentors, and admins.
- Code submissions with language, topic, difficulty, learning goal, and source code.
- AI-powered review that explains bugs, code quality issues, complexity concerns, and security risks.
- Categorized feedback with severity, reasoning, and suggested improvements.
- Revision workflow so students can improve code after feedback.
- Improvement comparison between original and revised submissions.
- Follow-up exercises generated or selected from review weaknesses.
- Mentor comments, approval, and override workflow for AI feedback.
- Admin management for users, mentor assignments, rubrics, and review categories.
- Progress tracking for student improvement over time.

## Planned Stack

- Next.js 16 with App Router and TypeScript.
- React with component-based UI.
- Tailwind CSS with accessible UI primitives.
- PostgreSQL for relational data.
- Prisma or Drizzle for database access.
- Auth.js or secure session-based authentication.
- Zod for request and form validation.
- AI SDK with OpenAI, Gemini, or Groq for review generation.
- Playwright and focused integration tests for critical workflows.
- Vercel deployment with GitHub Actions CI/CD.

## Core User Journey

1. A student signs up and creates a code submission.
2. The student selects the language, topic, difficulty, and learning goal.
3. CodeMentor AI returns categorized feedback with severity, explanation, and suggested fixes.
4. The student revises the code and compares the new version against the original.
5. The student completes follow-up exercises connected to the review feedback.
6. A mentor can inspect the AI review, add comments, approve feedback, or override weak guidance.
7. The platform records progress so students, mentors, and admins can track improvement.

## MVP Boundaries

The MVP supports JavaScript, TypeScript, and Python submissions. It does not execute untrusted code, provide real-time collaborative editing, or attempt to support every programming language.

Future scope includes safe sandboxed code execution, richer analytics, team classrooms, rubric templates, plagiarism detection, and adaptive learning paths.

## Assignment Submission Notes

The final deployed application footer must include:

- Name: `<your-name>`
- GitHub: `<your-github-profile>`
- LinkedIn: `<your-linkedin-profile>`

See [Phase 1 Product Scope](docs/phase-1-product-scope.md) for detailed roles, permissions, user flows, MVP decisions, and success criteria.
