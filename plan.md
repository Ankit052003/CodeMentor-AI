# AI-Powered Code Review Learning Platform: 10-Phase Build Plan

## Project Goal

Build a full-stack learning platform where beginner programmers submit code, receive AI-powered review feedback, improve their solution, and optionally get mentor guidance. The product should feel like an education-focused developer tool, not a generic CRUD application.

The final project should demonstrate:

- Next.js 16, React, TypeScript, Tailwind CSS, and PostgreSQL
- Secure authentication and role-based authorization
- Meaningful CRUD workflows around code submissions, reviews, comments, exercises, and progress
- AI-powered feedback that explains bugs, code quality issues, complexity problems, and security risks
- Clean, responsive, accessible UI
- Production-grade validation, error handling, testing, deployment, and CI/CD

## Recommended Product Name

CodeMentor AI

## Target Users

- Student: submits code, reads AI feedback, revises code, completes follow-up exercises, tracks improvement.
- Mentor: reviews student submissions, adds comments, verifies AI feedback, tracks stVudent progress.
- Admin: manages users, categories, review rubrics, platform settings, and moderation.

## Core Tech Stack

- Frontend/backend: Next.js 16 with App Router and TypeScript
- Styling: Tailwind CSS with shadcn/ui or Radix UI
- Database: PostgreSQL
- ORM: Prisma or Drizzle
- Authentication: Auth.js, Clerk, or secure JWT/session-based auth
- Validation: Zod
- AI: AI SDK with OpenAI, Gemini, or Groq
- Testing: Playwright for end-to-end tests, plus focused integration tests
- Deployment: Vercel
- CI/CD: GitHub Actions

## Architecture Direction

Use a clean modular architecture inside the Next.js application:

- `app/`: routes, layouts, server actions, API route handlers
- `components/`: reusable UI components
- `features/`: domain-oriented feature modules
- `lib/`: shared utilities, auth helpers, validation, AI client, database client
- `server/`: server-only services, repositories, authorization checks
- `tests/`: integration and end-to-end tests

Keep business logic out of UI components. UI components should render state and call actions. Server-side services should handle validation, authorization, persistence, and AI orchestration.

---

# Phase 1: Product Scope, User Flows, and Success Criteria

## Objective

Define exactly what the platform solves and what must be included in the internship submission.

## Tasks

- Define the main problem statement:
  - Beginners receive feedback but often do not understand what is wrong, why it is wrong, or how to improve.
- Define the MVP user roles:
  - Student
  - Mentor
  - Admin
- Define the main student workflow:
  - Sign up
  - Create a code submission
  - Select language, topic, difficulty, and learning goal
  - Receive AI review
  - Read categorized issues
  - Revise code
  - Compare improvement
  - Complete follow-up exercises
- Define the main mentor workflow:
  - View assigned students/submissions
  - Read AI review
  - Add human comments
  - Approve or override AI feedback
  - Mark improvement progress
- Define the main admin workflow:
  - Manage users
  - Assign mentors
  - Manage review categories and rubrics
  - View system-level analytics
- Decide the supported languages for MVP:
  - JavaScript
  - TypeScript
  - Python
- Decide what the app will not do in MVP:
  - Do not execute untrusted user code.
  - Do not provide real-time collaborative editing.
  - Do not support every programming language.

## Deliverables

- Clear README project description
- Feature list
- User roles and permissions table
- User journey diagram or written flow
- MVP and future-scope separation

## Done Criteria

- A recruiter can understand the problem and value within 60 seconds.
- The project clearly avoids being a basic CRUD app.
- The scope is achievable within the assignment timeline.

---

# Phase 2: Project Setup and Development Foundation

## Objective

Create a clean, professional Next.js codebase with quality tooling from the beginning.

## Tasks

- Initialize the Next.js 16 project with TypeScript.
- Configure Tailwind CSS.
- Add shadcn/ui or Radix UI components.
- Configure ESLint and Prettier.
- Configure strict TypeScript.
- Add environment variable validation.
- Set up PostgreSQL locally or through a managed provider.
- Add Prisma or Drizzle.
- Create base folder structure:
  - `app/`
  - `components/`
  - `features/`
  - `lib/`
  - `server/`
  - `tests/`
- Add initial layout:
  - Auth pages
  - Dashboard shell
  - Student navigation
  - Mentor navigation
  - Admin navigation
- Add reusable UI primitives:
  - Button
  - Input
  - Textarea
  - Select
  - Dialog
  - Table
  - Badge
  - Toast
  - Empty state
  - Loading state
  - Error state

## Deliverables

- Running Next.js app
- PostgreSQL connection
- Initial database migration setup
- Code formatting and linting
- `.env.example`
- Basic dashboard layout

## Done Criteria

- The app runs locally without manual hacks.
- The codebase has strict typing and predictable structure.
- New features can be added without reorganizing the project.

---

# Phase 3: Database Design, Authentication, and Authorization

## Objective

Build the secure identity and data foundation for the whole platform.

## Suggested Data Models

- `User`
  - id
  - name
  - email
  - role: `STUDENT`, `MENTOR`, `ADMIN`
  - createdAt
  - updatedAt
- `StudentProfile`
  - userId
  - skillLevel
  - preferredLanguages
  - learningGoals
- `MentorProfile`
  - userId
  - expertise
  - maxAssignedStudents
- `MentorAssignment`
  - mentorId
  - studentId
- `CodeSubmission`
  - id
  - studentId
  - title
  - language
  - topic
  - difficulty
  - prompt
  - sourceCode
  - status
  - createdAt
  - updatedAt
- `AIReview`
  - id
  - submissionId
  - summary
  - overallScore
  - correctnessScore
  - readabilityScore
  - complexityScore
  - securityScore
  - createdAt
- `ReviewIssue`
  - id
  - reviewId
  - category: `BUG`, `STYLE`, `COMPLEXITY`, `SECURITY`, `BEST_PRACTICE`
  - severity: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
  - lineStart
  - lineEnd
  - title
  - explanation
  - suggestion
- `MentorComment`
  - id
  - submissionId
  - mentorId
  - body
  - createdAt
- `Revision`
  - id
  - submissionId
  - sourceCode
  - changeSummary
  - createdAt
- `Exercise`
  - id
  - submissionId
  - title
  - description
  - difficulty
  - expectedConcept
- `ProgressEvent`
  - id
  - studentId
  - eventType
  - metadata
  - createdAt

## Authorization Rules

- Students can only access their own submissions, reviews, revisions, exercises, and progress.
- Mentors can only access submissions from assigned students.
- Mentors can create comments only on assigned student submissions.
- Admins can access and manage all users, assignments, rubrics, and submissions.
- AI review generation must only be triggered by the owner student, assigned mentor, or admin.

## Tasks

- Implement authentication.
- Add secure session handling.
- Add role-based route protection.
- Add server-side authorization helpers.
- Add database schema and migrations.
- Add seed data for demo users:
  - One student
  - One mentor
  - One admin
- Add validation schemas using Zod.

## Deliverables

- Working login/logout
- Role-based dashboards
- Database migrations
- Seed script
- Authorization helper functions

## Done Criteria

- Unauthorized users cannot access private data.
- Role checks happen on the server, not only in the UI.
- All user input is validated before database writes.

---

# Phase 4: Student Code Submission Workflow

## Objective

Build the core student experience for submitting code and viewing submission history.

## Tasks

- Create student dashboard overview:
  - Recent submissions
  - Average review score
  - Open improvement items
  - Progress trend
- Create new submission form:
  - Title
  - Programming language
  - Topic
  - Difficulty
  - Problem/prompt
  - Source code editor area
- Add syntax-highlighted code display.
- Add validation:
  - Required fields
  - Maximum code length
  - Supported language list
  - Safe text sanitization
- Add submission detail page.
- Add submission history with filters:
  - Language
  - Topic
  - Score range
  - Review status
- Add edit/delete rules:
  - Student can edit a draft.
  - Student cannot silently edit reviewed code; they must create a revision.
  - Student can delete draft submissions.
  - Reviewed submissions are archived instead of hard-deleted.

## Deliverables

- Student dashboard
- New submission form
- Submission detail page
- Submission history page
- Draft, submitted, reviewed, and archived states

## Done Criteria

- A student can submit code end to end.
- Submission state transitions are clear.
- The workflow feels like a real learning product, not a form-only CRUD screen.

---

# Phase 5: AI Code Review Engine

## Objective

Integrate AI in a structured, useful, and safe way.

## AI Review Output Structure

The AI should return structured JSON with:

- Summary
- Overall score
- Correctness score
- Readability score
- Complexity score
- Security score
- Issues list
- Suggested improved code
- Beginner-friendly explanation
- Follow-up exercises

## Review Categories

- Bugs and correctness
- Readability and naming
- Complexity and performance
- Security concerns
- Language best practices
- Edge cases
- Testing suggestions

## Tasks

- Add AI provider integration.
- Create a strict prompt template for code review.
- Use structured output validation with Zod.
- Store AI review results in PostgreSQL.
- Add retry handling for temporary AI failures.
- Add clear error messages for failed reviews.
- Add token/code length limits.
- Add AI safety boundaries:
  - Do not execute submitted code.
  - Do not request secrets.
  - Warn if submitted code contains possible credentials.
  - Avoid storing detected secrets in logs.
- Build review result UI:
  - Score cards
  - Issue category tabs
  - Severity badges
  - Line references
  - Suggested improvements
  - Beginner explanation
- Add review regeneration rules:
  - Student can regenerate only within fair limits.
  - Mentor/admin can regenerate when feedback quality is poor.

## Deliverables

- AI review service
- Structured prompt
- AI response schema validation
- Review storage
- Review detail UI
- Error handling for AI failures

## Done Criteria

- AI feedback is structured, categorized, and useful.
- The app handles AI failure gracefully.
- AI output is validated before being saved.
- The feature clearly adds intelligence beyond CRUD.

---

# Phase 6: Mentor Review and Human Feedback Workflow

## Objective

Add human-in-the-loop review so the platform feels production-ready and educationally credible.

## Tasks

- Create mentor dashboard:
  - Assigned students
  - Pending reviews
  - Recently reviewed submissions
  - Students needing attention
- Create assigned student profile view:
  - Student goals
  - Submission history
  - Progress trend
  - Repeated issue categories
- Create mentor submission review page:
  - Student code
  - AI review
  - Mentor comments
  - Suggested next steps
- Allow mentors to:
  - Add comments
  - Mark AI feedback as helpful/not helpful
  - Add private notes
  - Recommend exercises
  - Mark submission as reviewed
- Add notifications or activity feed:
  - New AI review ready
  - Mentor comment added
  - Exercise assigned

## Deliverables

- Mentor dashboard
- Assigned student view
- Mentor feedback workflow
- Activity feed or notification list

## Done Criteria

- Mentors can meaningfully guide students.
- Students can see mentor feedback clearly.
- The system demonstrates granular authorization.

---

# Phase 7: Improvement Tracker, Revisions, and Follow-Up Exercises

## Objective

Turn one-time code review into a learning loop.

## Tasks

- Add revision workflow:
  - Student submits improved code as a revision.
  - App compares review scores across revisions.
  - App shows what improved and what remains weak.
- Add improvement dashboard:
  - Repeated issue categories
  - Score trend over time
  - Language-wise progress
  - Topic-wise progress
- Add follow-up exercises:
  - AI-generated exercises based on weaknesses
  - Mentor-assigned exercises
  - Exercise completion status
- Add concept tracking:
  - Edge cases
  - Data structures
  - Functions
  - Async programming
  - Error handling
  - Security basics
- Add student reflection:
  - What did I change?
  - What did I learn?
  - What is still confusing?

## Deliverables

- Revision submission flow
- Before/after score comparison
- Progress analytics
- Exercise list and completion tracking
- Student reflection section

## Done Criteria

- The platform shows learning progress, not just review output.
- A recruiter can see that the product has educational depth.
- The data model supports long-term user growth.

---

# Phase 8: Admin, Security, Performance, and Real-World Readiness

## Objective

Add production-grade controls and document real-world considerations.

## Admin Features

- User management
- Role management
- Mentor-student assignment
- Review rubric management
- Submission moderation
- Platform analytics

## Security Tasks

- Validate all inputs with Zod.
- Enforce server-side authorization on every protected action.
- Add rate limits for AI review generation.
- Add CSRF/session protection based on the selected auth approach.
- Sanitize rendered markdown or AI output.
- Avoid logging source code if it may contain secrets.
- Add secret detection warning for submitted code.
- Add secure environment variable handling.
- Add database constraints and indexes.
- Add safe error boundaries.

## Performance Tasks

- Use server components where suitable.
- Use pagination for submission history.
- Cache stable dashboard queries.
- Add loading states and skeletons.
- Avoid sending unnecessary data to the client.
- Add indexes for common queries:
  - submissions by student
  - reviews by submission
  - mentor assignments by mentor

## Real-World Documentation

Document how the app handles:

- AI provider downtime
- Long code submissions
- Abuse and rate limiting
- Unauthorized access attempts
- Data privacy
- Mentor assignment scaling
- Future code execution sandboxing

## Deliverables

- Admin dashboard
- Rate limiting
- Security hardening
- Performance improvements
- Real-world considerations section in README

## Done Criteria

- The app is secure enough for a serious demo.
- Real-world risks are explicitly addressed.
- Admin features prove the app can scale beyond a single user.

---

# Phase 9: Testing, CI/CD, and Deployment

## Objective

Prove that the platform works reliably and can be deployed professionally.

## Testing Strategy

Prefer tests that validate real user workflows:

- Student signup/login
- Student creates code submission
- AI review is generated and displayed
- Student creates a revision
- Mentor comments on assigned submission
- Unauthorized user cannot access another student's submission
- Admin assigns mentor to student

## Tasks

- Add Playwright end-to-end tests.
- Add focused integration tests for:
  - Authorization helpers
  - Submission creation
  - AI response validation
  - Mentor assignment access
- Add test database setup.
- Add CI workflow with GitHub Actions:
  - Install dependencies
  - Run type check
  - Run lint
  - Run tests
  - Build app
- Deploy to Vercel.
- Configure production environment variables.
- Configure production PostgreSQL.
- Add deployment link to README.

## Deliverables

- E2E tests
- Integration tests
- GitHub Actions CI
- Live deployment
- Production database configuration

## Done Criteria

- CI passes on GitHub.
- The live app works with demo accounts.
- The submission includes both GitHub repository and live deployment.

---

# Phase 10: Final Polish, Recruiter Demo, and Submission Package

## Objective

Make the project feel complete, professional, and easy to evaluate.

## UI Polish

- Make dashboards clean and information-dense.
- Add responsive mobile layouts.
- Add accessible labels and keyboard-friendly interactions.
- Add empty states for new users.
- Add loading and error states.
- Use consistent spacing, colors, typography, and button styles.
- Ensure long code snippets and AI text do not break the layout.

## Demo Data

Create demo accounts:

- Student demo account
- Mentor demo account
- Admin demo account

Add demo submissions showing:

- A bug-heavy beginner solution
- A readable but inefficient solution
- A solution with security concerns
- A revised solution with visible improvement

## README Requirements

The README should include:

- Project overview
- Problem statement
- Key features
- Tech stack
- Architecture explanation
- Database schema summary
- Authentication and authorization rules
- AI integration explanation
- Security considerations
- Testing strategy
- Deployment link
- Demo credentials
- Local setup instructions
- Future improvements

## Footer Requirement From PDF

Add footer in the application with:

- Your name
- GitHub profile link
- LinkedIn profile link

## Recruiter Demo Script

Prepare a short walkthrough:

1. Login as student.
2. Submit beginner code.
3. Generate AI review.
4. Show categorized feedback and suggested improvement.
5. Submit a revision.
6. Show progress improvement.
7. Login as mentor.
8. Add mentor feedback.
9. Login as admin.
10. Show user management and mentor assignment.

## Final Submission Checklist

- GitHub repository is public or accessible.
- Live deployment works.
- README is complete.
- Demo credentials work.
- Footer contains name, GitHub, and LinkedIn.
- CI pipeline passes.
- Database migrations are included.
- Environment variables are documented in `.env.example`.
- No secrets are committed.
- UI is responsive.
- Auth and authorization are working.
- AI review is reliable enough for demo.
- Tests cover core workflows.

## Done Criteria

- A recruiter can evaluate the project without asking for setup help.
- The application clearly satisfies the PDF criteria.
- The project demonstrates product thinking, AI capability, full-stack engineering, and production awareness.

---

# Suggested MVP Priority

If time becomes limited, build these first:

1. Authentication with Student, Mentor, and Admin roles
2. Student code submission workflow
3. AI review generation with categorized feedback
4. Review history and submission detail pages
5. Mentor comments
6. Revision and improvement tracking
7. Admin mentor assignment
8. Security validation and authorization
9. Deployment
10. README and demo polish

# Features That Will Impress Recruiters

- AI feedback stored as structured review data instead of plain chatbot text
- Role-based access with real server-side authorization
- Revision comparison showing student improvement
- Mentor verification of AI feedback
- Security category in code review
- Rate limiting for AI generation
- Secret detection warning for submitted code
- E2E tests covering student and mentor workflows
- Clean README explaining architecture and real-world tradeoffs
- Professional demo data that makes the product easy to understand
