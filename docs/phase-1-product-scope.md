# Phase 1 Product Scope

## Objective

Define the product scope for CodeMentor AI before implementation starts. This phase turns the assignment prompt into a focused product concept with clear users, workflows, permissions, MVP boundaries, and success criteria.

## Product Positioning

CodeMentor AI is a full-stack learning platform that helps beginner programmers turn code review into measurable improvement. The platform combines AI review, revision tracking, mentor validation, and follow-up exercises so students understand what is wrong, why it matters, and how to fix it.

This is not a generic CRUD application. CRUD exists only as infrastructure for a stronger learning workflow: submissions, AI reviews, revisions, mentor comments, exercises, rubrics, and progress records.

## Problem Statement

Beginner programmers struggle to improve when feedback is vague, too advanced, or disconnected from practice. They need review comments that explain root causes, show concrete improvements, and create a next learning step. Mentors need a faster way to identify repeated weaknesses without manually reviewing every submission from scratch.

## Product Goals

- Help students understand code issues in plain language.
- Categorize feedback by bugs, readability, complexity, security, and learning gaps.
- Support revision and comparison so improvement is visible.
- Give mentors tools to validate AI output and add human context.
- Give admins control over users, mentor assignments, rubrics, and review categories.
- Demonstrate production-ready full-stack engineering with security, validation, testing, deployment, and CI/CD.

## MVP Roles

| Role | Description |
| --- | --- |
| Student | Learner who submits code, reads AI review feedback, revises code, completes exercises, and tracks progress. |
| Mentor | Reviewer who supervises assigned students, reviews AI feedback, adds comments, approves or overrides AI suggestions, and tracks improvement. |
| Admin | Platform operator who manages users, mentor assignments, review categories, rubrics, moderation, and system analytics. |

## Permissions

| Capability | Student | Mentor | Admin |
| --- | --- | --- | --- |
| Create own submissions | Yes | No | No |
| View own submissions | Yes | No | No |
| Update own draft submissions | Yes | No | No |
| Delete own draft submissions | Yes | No | No |
| Request AI review for own submission | Yes | No | No |
| View AI review for own submission | Yes | Yes, when assigned | Yes |
| Create revisions for own submission | Yes | No | No |
| Compare own revisions | Yes | Yes, when assigned | Yes |
| Complete follow-up exercises | Yes | No | No |
| View assigned student submissions | No | Yes | Yes |
| Add mentor comments | No | Yes, when assigned | Yes |
| Approve AI feedback | No | Yes, when assigned | Yes |
| Override AI feedback | No | Yes, when assigned | Yes |
| Mark student improvement progress | No | Yes, when assigned | Yes |
| Manage users | No | No | Yes |
| Assign mentors | No | No | Yes |
| Manage review categories | No | No | Yes |
| Manage rubrics | No | No | Yes |
| View platform analytics | No | Limited to assigned students | Yes |

## Student Workflow

1. Student signs up and enters the dashboard.
2. Student creates a code submission.
3. Student selects language, topic, difficulty, and learning goal.
4. Student submits source code for AI review.
5. Platform validates the submission and stores it securely.
6. AI generates categorized feedback for bugs, code quality, complexity, security, and learning recommendations.
7. Student reads the feedback with severity, explanation, and suggested fix.
8. Student revises the code.
9. Student compares the original submission with the revised version.
10. Student completes follow-up exercises based on weak areas.
11. Student progress is updated.

## Mentor Workflow

1. Mentor signs in and views assigned students.
2. Mentor opens a student submission and its AI review.
3. Mentor checks whether the AI feedback is accurate and useful.
4. Mentor adds human comments where context is missing.
5. Mentor approves accurate AI feedback or overrides weak feedback.
6. Mentor marks student progress after reviewing revisions.
7. Mentor uses progress history to identify recurring student issues.

## Admin Workflow

1. Admin signs in to the admin dashboard.
2. Admin manages users and role assignments.
3. Admin assigns mentors to students.
4. Admin manages review categories and rubrics.
5. Admin views high-level analytics such as review volume, student progress, and mentor activity.
6. Admin moderates problematic submissions or feedback records when needed.

## Supported Languages For MVP

- JavaScript
- TypeScript
- Python

These languages are enough to demonstrate a useful programming-learning workflow without spreading the review logic across too many language-specific rules.

## MVP Feature Set

| Feature Area | Included In MVP |
| --- | --- |
| Authentication | Sign up, sign in, sign out, protected routes, role-based access. |
| Student submissions | Create, view, update drafts, delete drafts, submit for review. |
| AI review | Generate categorized feedback with severity, explanation, and suggested fixes. |
| Revisions | Create revised code versions and compare against original submissions. |
| Follow-up practice | Recommend or generate exercises based on review weaknesses. |
| Mentor guidance | Comments, AI review approval, AI feedback override, progress marking. |
| Admin controls | User management, mentor assignment, category management, rubric management. |
| Progress tracking | Student-level improvement history and mentor/admin visibility. |
| Security | Input validation, authorization checks, sanitized rendering, no untrusted code execution. |
| Deployment | Live deployment with environment configuration and CI/CD. |

## Out Of Scope For MVP

- Executing untrusted user code.
- Real-time collaborative editing.
- Support for every programming language.
- Live chat between students and mentors.
- Classroom billing, payment, or subscription features.
- Plagiarism detection.
- Advanced IDE features such as autocomplete, debugging, or terminal access.

## Future Scope

- Safe sandboxed code execution with time, memory, and network limits.
- Adaptive learning paths based on repeated review patterns.
- Classroom and cohort management.
- Rubric templates for different programming levels.
- Plagiarism and AI-generated-code detection.
- Mentor workload analytics.
- Team or institution accounts.
- More languages such as Java, C++, Go, and Rust.
- Exportable progress reports for students and mentors.

## Success Criteria

- A recruiter can understand the product value within 60 seconds from the README.
- The app demonstrates more than CRUD by showing an AI-assisted learning loop.
- Every core user role has a meaningful workflow.
- Authorization rules are clear before implementation starts.
- MVP scope is achievable within the assignment timeline.
- Technical choices align with the assignment: Next.js 16, React, TypeScript, Tailwind CSS, PostgreSQL, authentication, authorization, AI, validation, deployment, and CI/CD.

## Real-World Considerations To Carry Into Later Phases

- Never execute submitted code in the MVP.
- Treat all submitted code as untrusted user input.
- Store AI prompts and responses with enough metadata for debugging and auditability.
- Require mentor approval or override when AI feedback is weak, unsafe, or misleading.
- Keep authorization checks server-side for every protected action.
- Keep validation schemas shared between forms and server actions where practical.
- Use structured error messages and avoid leaking sensitive request details to users.
