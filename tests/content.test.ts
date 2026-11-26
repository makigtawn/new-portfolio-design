import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { parseSiteContent } from "@/src/lib/content/schema";
import { slugFromTitle } from "@/src/lib/content/slug";
import { getPublicSiteUrl, getSiteUrl } from "@/src/lib/site-url";

const sitePath = fileURLToPath(
  new URL("../content/site.json", import.meta.url),
);

describe("site content", () => {
  it("validates the shipped content and image alt text", () => {
    const raw = readFileSync(sitePath, "utf8");
    const content = parseSiteContent(raw);
    expect(raw).not.toContain("PLACEHOLDER CONTENT");
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
      '"alt": "Concept wireframe illustrating a clinic patient queue sequence and priority status"',
      '"alt": ""',
    );
    expect(() => parseSiteContent(source)).toThrow(/Alt text is required/);
  });

  it("accepts optional education and resume fields when valid", () => {
    const parsed = JSON.parse(readFileSync(sitePath, "utf8")) as Record<
      string,
      unknown
    >;
    const content = parseSiteContent(
      JSON.stringify({
        ...parsed,
        profile: {
          ...(parsed.profile as Record<string, unknown>),
          resume: { label: "Download CV", href: "/resume.pdf" },
        },
        education: [
          {
            institution: "Bahir Dar University",
            program: "B.Sc. in Software Engineering",
            period: "2022 - 2026",
          },
        ],
      }),
    );
    expect(content.profile.resume?.href).toBe("/resume.pdf");
    expect(content.education).toHaveLength(1);
  });
});

describe("site URL resolution", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
  });

  it("rejects localhost and example.dev from public site URLs", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3001";
    expect(getPublicSiteUrl()).toBeNull();
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.dev";
    expect(getPublicSiteUrl()).toBeNull();
    expect(getSiteUrl().hostname).toBe("localhost");
  });

  it("uses configured production URLs when valid", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://meklit.dev";
    expect(getPublicSiteUrl()?.toString()).toBe("https://meklit.dev/");
  });
});

describe("slugFromTitle", () => {
  it("normalizes punctuation, spaces, and accents", () => {
    expect(slugFromTitle("  Café queue: a small tool!  ")).toBe(
      "cafe-queue-a-small-tool",
    );
  });
});
