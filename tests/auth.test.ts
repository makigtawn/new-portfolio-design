import { beforeEach, describe, expect, it } from "vitest";
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
