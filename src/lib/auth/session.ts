import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE_NAME = "portfolio_admin_session";
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

function sessionKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be at least 32 characters long.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminToken(now = new Date()): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt(Math.floor(now.getTime() / 1000))
    .setExpirationTime(Math.floor(now.getTime() / 1000) + ADMIN_SESSION_SECONDS)
    .sign(sessionKey());
}

export async function verifyAdminToken(
  token: string,
  now = new Date(),
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, sessionKey(), {
      algorithms: ["HS256"],
      currentDate: now,
    });
    return payload.sub === "admin" && payload.role === "admin";
  } catch {
    return false;
  }
}
