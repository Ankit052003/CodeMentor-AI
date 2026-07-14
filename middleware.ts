import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = new Set<string>();

function isStateChangingMethod(method: string) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method);
}

export function middleware(request: NextRequest) {
  const { method } = request;

  const upgrade = request.headers.get("upgrade")?.toLowerCase();
  if (upgrade === "websocket") {
    return NextResponse.next();
  }

  if (isStateChangingMethod(method)) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    const host = request.headers.get("host") ?? "";
    ALLOWED_ORIGINS.add(`https://${host}`);
    ALLOWED_ORIGINS.add(`http://${host}`);

    let isValid = false;

    if (origin && ALLOWED_ORIGINS.has(origin)) {
      isValid = true;
    } else if (referer) {
      try {
        const refUrl = new URL(referer);
        if (refUrl.host === host) {
          isValid = true;
        }
      } catch {}
    }

    if (!isValid && origin) {
      return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 });
    }
  }

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
