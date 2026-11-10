import { afterEach, describe, expect, it, vi } from "vitest";
import {
  commitSiteContentToGitHub,
  GitHubConflictError,
  serializeContentWithPlaceholderNote,
} from "@/src/lib/github/contents";
import { parseSiteContent, type SiteContent } from "@/src/lib/content/schema";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const contentPath = fileURLToPath(
  new URL("../content/site.json", import.meta.url),
);
const content = parseSiteContent(readFileSync(contentPath, "utf8"));
const encodedCurrentFile = (sha: string) =>
  JSON.stringify({
    sha,
    encoding: "base64",
    content: Buffer.from(serializeContentWithPlaceholderNote(content)).toString(
      "base64",
    ),
  });

describe("GitHub Contents API save helper", () => {
  afterEach(() => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_REPO;
    delete process.env.GITHUB_BRANCH;
  });

  it("checks the editor baseline and sends the current SHA with the update", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.GITHUB_REPO = "example/portfolio";
    process.env.GITHUB_BRANCH = "main";
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(encodedCurrentFile("current-sha"), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ content: { sha: "saved-sha" } }), {
          status: 200,
        }),
      );

    const result = await commitSiteContentToGitHub(
      content,
      content,
      fetcher as unknown as typeof fetch,
    );
    const update = JSON.parse(fetcher.mock.calls[1]?.[1]?.body as string) as {
      sha: string;
      content: string;
      branch: string;
    };
    expect(result.sha).toBe("saved-sha");
    expect(update.sha).toBe("current-sha");
    expect(update.branch).toBe("main");
    expect(Buffer.from(update.content, "base64").toString("utf8")).toContain(
      "PLACEHOLDER CONTENT",
    );
    expect(String(fetcher.mock.calls[0]?.[0])).toContain("?ref=main");
  });

  it("rejects stale editor content before attempting an update", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.GITHUB_REPO = "example/portfolio";
    process.env.GITHUB_BRANCH = "main";
    const stale = {
      ...content,
      hero: { ...content.hero, subline: "An older version of the copy." },
    } satisfies SiteContent;
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(encodedCurrentFile("newer-sha"), { status: 200 }),
      );

    await expect(
      commitSiteContentToGitHub(
        content,
        stale,
        fetcher as unknown as typeof fetch,
      ),
    ).rejects.toBeInstanceOf(GitHubConflictError);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("surfaces an update conflict if GitHub changes after the SHA read", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.GITHUB_REPO = "example/portfolio";
    process.env.GITHUB_BRANCH = "main";
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(encodedCurrentFile("current-sha"), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response("conflict", { status: 409 }));

    await expect(
      commitSiteContentToGitHub(
        content,
        content,
        fetcher as unknown as typeof fetch,
      ),
    ).rejects.toBeInstanceOf(GitHubConflictError);
  });
});
