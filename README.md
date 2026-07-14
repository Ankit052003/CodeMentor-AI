# CodeMentor AI

**AI-powered code review platform** — a full-stack, production-grade education workflow built with Next.js 16, PostgreSQL, and Google Gemini. Students submit code and receive structured AI feedback; mentors validate reviews; admins manage the platform — all secured with server-side authorization, CSRF protection, and rate limiting.

> Built by **Ankit Kumar** — [GitHub](https://github.com/Ankit052003) · [LinkedIn](https://www.linkedin.com/in/ankit-kumar-501356301/)

---

## Login Credentials

| Role | Email | Password |
| --- | --- | --- |
| 🎓 **Student** | student@codementor.ai | Password123! |
| 👨‍🏫 **Mentor** | mentor@codementor.ai | Password123! |
| ⚙️ **Admin** | admin@codementor.ai | Password123! |

Click any account card on the login page to sign in instantly — no typing required.

---

## Why This Project Stands Out

Most coding platforms give a score and stop. CodeMentor AI treats code review as a **guided learning loop**:

1. **Submit** code with context (language, topic, difficulty)
2. **AI Review** returns structured feedback — scores, categorized issues, security warnings, and suggestions
3. **Revise** and compare changes side-by-side
4. **Mentor** validates or overrides AI feedback
5. **Track** progress across submissions over time

This isn't a chatbot-wrapped CRUD app. The AI review produces **structured, validated data** stored relationally — enabling analytics, trend tracking, and mentor verification per category.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript** (strict mode) |
| Database | **PostgreSQL** + Prisma ORM (14 models, indexed) |
| Auth | Session-based (HMAC-signed cookies, SHA-256 tokens, scrypt hashing) |
| AI | **Google Gemini 2.0 Flash** + heuristic fallback engine |
| Validation | **Zod** (every API endpoint) |
| Styling | **Tailwind CSS v4** (custom UI kit, dark mode) |
| Testing | **Playwright** (E2E) + **Vitest** (integration) — 26 tests |
| CI/CD | **GitHub Actions** + **Vercel** |
| Infra | Docker Compose (local PostgreSQL) |

---

## Engineering Highlights

### AI Review Engine (`server/ai/`)
- **Dual-mode**: tries Gemini 2.0 Flash first, falls back to a deterministic heuristic engine when the API is unavailable — platform works fully without any API key
- **Structured output**: 5 dimension scores (0–100), categorized issues (BUG/STYLE/COMPLEXITY/SECURITY/BEST_PRACTICE), severity levels, line references, suggested code, follow-up exercises, security warnings
- **Zod-validated**: every AI response validated against a strict schema before storage
- **Secret detection**: regex patterns scan for API keys, tokens, private keys in submitted code
- **Rate-limited**: 5 reviews per 15 minutes per user, 10-minute per-submission cooldown

### Security Architecture
- **Server-side authorization** on every API route and server component — not UI-gated
- **HMAC-signed session cookies** — each cookie signed with `SESSION_SECRET` using SHA-256 HMAC, verified on every request with constant-time comparison
- **CSRF protection** via origin/referer validation on all state-changing requests
- **Input sanitization** strips control characters before storage
- **Rate limiting** with `X-RateLimit-*` headers
- **Security headers**: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- **Error boundaries** at root and dashboard levels
- **Environment validation** at startup via Zod schema

### Database Schema (14 Models)
Users, sessions, student/mentor profiles, submissions, AI reviews (with issues), mentor assignments, comments, revisions, exercises, progress events, review categories, rubrics, notifications — with indexes on all common query paths and unique constraints preventing duplicate assignments.

### Admin Platform
Full CRUD for users (inline role changes), mentor-student assignments, review rubrics, and submission moderation. Platform analytics showing submission counts by status/language and average scores across dimensions.

### Performance
Server-component-first architecture, paginated submission history with server-side filtering, targeted Prisma `select` queries (no over-fetching), loading skeletons throughout.

### Responsive Design
Fully responsive across mobile, tablet, and desktop with a collapsible hamburger navigation menu, stacked layouts on small screens, and adaptive grid systems.

---

## Architecture

```
                    Next.js 16 App Router
                    │
        ┌───────────┼───────────────┐
        │           │               │
   Server Comps   Client Comps    API Routes
   (data/auth)    (interactivity) (validation → logic)
        │           │               │
        └───────────┼───────────────┘
                    │
        ┌───────────┴───────────────┐
        │                           │
    Prisma ORM                 Gemini AI
    (PostgreSQL)             (or heuristic)
```

**Key decisions:**
- **Session auth over JWT** — simpler token revocation, no token refresh complexity, built-in expiry, HMAC-signed cookies
- **Server components** for data fetching — reduces client bundle, improves SEO, eliminates waterfall requests
- **Structured AI output over chat** — enables analytics, trend tracking, and mentor override per-category
- **Heuristic fallback** — the platform works fully without any API key, critical for demos and CI

---

## Local Setup

```bash
# Prerequisites: Node.js 22+, PostgreSQL

git clone <repo-url>
cd codementor-ai
npm ci

# Configure environment
cp .env.example .env.local
# Edit .env.local with DATABASE_URL and SESSION_SECRET

# Database
npx prisma generate
npx prisma db push
npm run db:seed

# Start
npm run dev        # → http://localhost:3000
```

### With Docker
```bash
docker compose up -d    # starts PostgreSQL
npm ci
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

---

## Testing

```bash
# Integration tests (12 tests — auth, AI schema, authorization)
npm test

# E2E tests (14 tests — login, student submission, admin workflows)
npm run test:e2e
```

---

## CI/CD

GitHub Actions CI (`.github/workflows/ci.yml`) runs on every push:
1. Sets up Node.js + PostgreSQL service
2. Installs dependencies, generates Prisma client, pushes schema, seeds data
3. Runs type checking, linting, and production build

Deploy to Vercel with `vercel.json` — set `DATABASE_URL`, `SESSION_SECRET`, and optionally `GEMINI_API_KEY` in the dashboard.

---

## What I'd Add Next

- **Monaco code editor** — replace textarea with full editor (syntax highlighting, autocomplete)
- **Redis** — replace in-memory rate limiting for multi-instance deployments
- **Code execution sandbox** — WebContainer/WASM to run student code safely in the browser
- **Classroom management** — groups, invitations, shared rubrics
- **TanStack Query** — replace raw `fetch()` calls with cached, optimistic UI

---

## About Me

**Ankit Kumar**

- GitHub: [github.com/Ankit052003](https://github.com/Ankit052003)
- LinkedIn: [linkedin.com/in/ankit-kumar-501356301](https://www.linkedin.com/in/ankit-kumar-501356301/)

This project demonstrates full-stack engineering with AI integration, production security practices, and thoughtful education product design — built for the House of Edtech full-stack assignment.
