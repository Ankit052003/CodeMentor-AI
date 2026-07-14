import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  GEMINI_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

let validated = false;

export function validateEnv() {
  if (validated) return;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Environment variable validation failed:", parsed.error.issues);
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables");
    }
  }
  validated = true;
}
