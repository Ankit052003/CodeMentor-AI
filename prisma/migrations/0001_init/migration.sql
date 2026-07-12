CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'MENTOR', 'ADMIN');
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "ProgrammingLanguage" AS ENUM ('JAVASCRIPT', 'TYPESCRIPT', 'PYTHON');
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED', 'ARCHIVED');
CREATE TYPE "ReviewIssueCategory" AS ENUM ('BUG', 'STYLE', 'COMPLEXITY', 'SECURITY', 'BEST_PRACTICE');
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ProgressEventType" AS ENUM ('ACCOUNT_CREATED', 'SUBMISSION_DRAFTED', 'SUBMISSION_SUBMITTED', 'SUBMISSION_ARCHIVED', 'REVISION_CREATED', 'EXERCISE_COMPLETED', 'MENTOR_COMMENT_CREATED', 'AI_REVIEW_CREATED');
CREATE TYPE "ExerciseStatus" AS ENUM ('ASSIGNED', 'COMPLETED');
CREATE TYPE "ReviewVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'OVERRIDDEN');

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
  "id" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_profiles" (
  "user_id" TEXT NOT NULL,
  "skill_level" "SkillLevel" NOT NULL,
  "preferred_languages" "ProgrammingLanguage"[] NOT NULL,
  "learning_goals" TEXT[] NOT NULL,
  CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "mentor_profiles" (
  "user_id" TEXT NOT NULL,
  "expertise" TEXT[] NOT NULL,
  "max_assigned_students" INTEGER NOT NULL DEFAULT 10,
  CONSTRAINT "mentor_profiles_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "mentor_assignments" (
  "id" TEXT NOT NULL,
  "mentor_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "mentor_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "code_submissions" (
  "id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "language" "ProgrammingLanguage" NOT NULL,
  "topic" TEXT NOT NULL,
  "difficulty" "Difficulty" NOT NULL,
  "prompt" TEXT NOT NULL,
  "source_code" TEXT NOT NULL,
  "sanitized_source_code" TEXT NOT NULL,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
  "submitted_at" TIMESTAMP(3),
  "archived_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "code_submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_reviews" (
  "id" TEXT NOT NULL,
  "submission_id" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "overall_score" INTEGER NOT NULL,
  "correctness_score" INTEGER NOT NULL,
  "readability_score" INTEGER NOT NULL,
  "complexity_score" INTEGER NOT NULL,
  "security_score" INTEGER NOT NULL,
  "verification_status" "ReviewVerificationStatus" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "review_issues" (
  "id" TEXT NOT NULL,
  "review_id" TEXT NOT NULL,
  "category" "ReviewIssueCategory" NOT NULL,
  "severity" "Severity" NOT NULL,
  "line_start" INTEGER,
  "line_end" INTEGER,
  "title" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "suggestion" TEXT NOT NULL,
  CONSTRAINT "review_issues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mentor_comments" (
  "id" TEXT NOT NULL,
  "submission_id" TEXT NOT NULL,
  "mentor_id" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "mentor_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "revisions" (
  "id" TEXT NOT NULL,
  "submission_id" TEXT NOT NULL,
  "source_code" TEXT NOT NULL,
  "change_summary" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "revisions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercises" (
  "id" TEXT NOT NULL,
  "submission_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "difficulty" "Difficulty" NOT NULL,
  "expected_concept" TEXT NOT NULL,
  "status" "ExerciseStatus" NOT NULL DEFAULT 'ASSIGNED',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "progress_events" (
  "id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "event_type" "ProgressEventType" NOT NULL,
  "metadata" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "progress_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "review_categories" (
  "id" TEXT NOT NULL,
  "code" "ReviewIssueCategory" NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "review_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "review_rubrics" (
  "id" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "guidance" TEXT NOT NULL,
  "min_score" INTEGER NOT NULL,
  "max_score" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "review_rubrics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");
CREATE UNIQUE INDEX "mentor_assignments_mentor_id_student_id_key" ON "mentor_assignments"("mentor_id", "student_id");
CREATE INDEX "mentor_assignments_student_id_idx" ON "mentor_assignments"("student_id");
CREATE INDEX "code_submissions_student_id_status_created_at_idx" ON "code_submissions"("student_id", "status", "created_at");
CREATE INDEX "code_submissions_language_idx" ON "code_submissions"("language");
CREATE UNIQUE INDEX "ai_reviews_submission_id_key" ON "ai_reviews"("submission_id");
CREATE INDEX "review_issues_review_id_category_idx" ON "review_issues"("review_id", "category");
CREATE INDEX "mentor_comments_submission_id_idx" ON "mentor_comments"("submission_id");
CREATE INDEX "mentor_comments_mentor_id_idx" ON "mentor_comments"("mentor_id");
CREATE INDEX "revisions_submission_id_idx" ON "revisions"("submission_id");
CREATE INDEX "exercises_submission_id_idx" ON "exercises"("submission_id");
CREATE INDEX "progress_events_student_id_created_at_idx" ON "progress_events"("student_id", "created_at");
CREATE UNIQUE INDEX "review_categories_code_key" ON "review_categories"("code");
CREATE INDEX "review_rubrics_category_id_idx" ON "review_rubrics"("category_id");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mentor_profiles" ADD CONSTRAINT "mentor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mentor_assignments" ADD CONSTRAINT "mentor_assignments_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mentor_assignments" ADD CONSTRAINT "mentor_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "code_submissions" ADD CONSTRAINT "code_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_reviews" ADD CONSTRAINT "ai_reviews_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "code_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_issues" ADD CONSTRAINT "review_issues_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "ai_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mentor_comments" ADD CONSTRAINT "mentor_comments_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "code_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mentor_comments" ADD CONSTRAINT "mentor_comments_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "code_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "code_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "progress_events" ADD CONSTRAINT "progress_events_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_rubrics" ADD CONSTRAINT "review_rubrics_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "review_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
