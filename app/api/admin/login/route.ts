import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_SECONDS,
  createAdminToken,
} from "@/src/lib/auth/session";
import { checkLoginRateLimit } from "@/src/lib/admin/rate-limit";

export const runtime = "nodejs";

const loginSchema = z.object({ password: z.string().min(1).max(256) });
const genericError = "Unable to sign in. Check the password and try again.";

function passwordsMatch(candidate: string, actual: string): boolean {
  const candidateHash = createHash("sha256").update(candidate).digest();
  const actualHash = createHash("sha256").update(actual).digest();
  return timingSafeEqual(candidateHash, actualHash);
}

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const identifier =
    forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const limit = checkLoginRateLimit(identifier);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: genericError },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: genericError }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  const expected = process.env.ADMIN_PASSWORD;
  if (
    !parsed.success ||
    !expected ||
    !passwordsMatch(parsed.data.password, expected)
  ) {
    return NextResponse.json({ error: genericError }, { status: 401 });
  }

  const token = await createAdminToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  return response;
}
