import { randomBytes, createHash, createHmac } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "cm_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SECRET = process.env.SESSION_SECRET ?? "default-secret-change-me-in-production";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function signCookie(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
};

/**
 * Create a new session for the given user, store it in the database,
 * and set an HTTP-only cookie on the response.
 */
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieValue = `${token}.${signCookie(token)}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });

  return token;
}

/**
 * Read the session cookie, look up the session in the database,
 * and return the associated user. Returns null if not authenticated.
 */
function parseCookieValue(raw: string): string | null {
  const dot = raw.lastIndexOf(".");
  if (dot === -1) return null;
  const value = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = signCookie(value);
  if (sig.length !== expected.length) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0 ? value : null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) return null;

  const token = parseCookieValue(raw);
  if (!token) return null;

  const tokenHash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    // Expired — clean up
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}

/**
 * Destroy the current session: delete from the database and clear the cookie.
 */
export async function destroySession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (raw) {
    const token = parseCookieValue(raw);
    if (token) {
      const tokenHash = hashToken(token);
      await prisma.session.deleteMany({ where: { tokenHash } });
    }
  }

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}


