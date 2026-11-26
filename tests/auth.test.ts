import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getTrustedClientIdentifier } from "@/src/lib/admin/rate-limit";
import { createAdminToken, verifyAdminToken } from "@/src/lib/auth/session";

describe("admin session token", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET =
      "unit-test-session-secret-with-more-than-32-characters";
  });

  it("signs and verifies an eight-hour admin session", async () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const token = await createAdminToken(now);
    expect(
      await verifyAdminToken(token, new Date("2026-01-01T07:59:59.000Z")),
    ).toBe(true);
    expect(
      await verifyAdminToken(token, new Date("2026-01-01T08:00:01.000Z")),
    ).toBe(false);
  });

  it("rejects modified tokens", async () => {
    const token = await createAdminToken();
    const parts = token.split(".");
    const signature = parts[2] ?? "";
    parts[2] = `${signature[0] === "a" ? "b" : "a"}${signature.slice(1)}`;
    const changed = parts.join(".");
    expect(await verifyAdminToken(changed)).toBe(false);
  });
});

describe("trusted client IP resolution", () => {
  afterEach(() => {
    delete process.env.VERCEL;
    delete process.env.TRUST_PROXY;
  });

  it("ignores spoofed x-forwarded-for when no trusted proxy is configured", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5" });
    expect(getTrustedClientIdentifier(headers)).toBe("direct-client");
  });

  it("uses x-vercel-forwarded-for when running on Vercel", () => {
    process.env.VERCEL = "1";
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.5",
      "x-vercel-forwarded-for": "198.51.100.77",
    });
    expect(getTrustedClientIdentifier(headers)).toBe("198.51.100.77");
  });

  it("uses the rightmost x-forwarded-for hop when TRUST_PROXY is enabled", () => {
    process.env.TRUST_PROXY = "1";
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.5, 198.51.100.42",
    });
    expect(getTrustedClientIdentifier(headers)).toBe("198.51.100.42");
  });
});
