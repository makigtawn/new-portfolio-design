import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseSiteContent } from "@/src/lib/content/schema";
import { slugFromTitle } from "@/src/lib/content/slug";

const sitePath = fileURLToPath(
  new URL("../content/site.json", import.meta.url),
);

describe("site content", () => {
  it("validates the shipped placeholder content and image alt text", () => {
    const content = parseSiteContent(readFileSync(sitePath, "utf8"));
    expect(content.projects.map((project) => project.slug)).toEqual([
      "clinic-queue-manager",
      "social-media-agent",
    ]);
    expect(content.profile.photo.alt).toBeTruthy();
    expect(
      content.projects.every((project) => project.cover.alt.length > 0),
    ).toBe(true);
  });

  it("rejects missing image alt text", () => {
    const source = readFileSync(sitePath, "utf8").replace(
      '"alt": "Queue dashboard concept showing patient sequence, wait time, and priority status"',
      '"alt": ""',
    );
    expect(() => parseSiteContent(source)).toThrow(/Alt text is required/);
  });
});

describe("slugFromTitle", () => {
  it("normalizes punctuation, spaces, and accents", () => {
    expect(slugFromTitle("  Café queue: a small tool!  ")).toBe(
      "cafe-queue-a-small-tool",
    );
  });
});
