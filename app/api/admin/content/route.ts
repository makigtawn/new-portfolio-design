import { NextResponse } from "next/server";
import { siteContentSchema } from "@/src/lib/content/schema";
import { z } from "zod";
import {
  commitSiteContentToGitHub,
  GitHubConflictError,
  GitHubConfigurationError,
} from "@/src/lib/github/contents";

export const runtime = "nodejs";

const saveRequestSchema = z.object({
  expectedContent: siteContentSchema,
  content: siteContentSchema,
});

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "The content request must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = saveRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "The content did not pass validation.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const saved = await commitSiteContentToGitHub(
      parsed.data.content,
      parsed.data.expectedContent,
    );
    return NextResponse.json({ ok: true, sha: saved.sha });
  } catch (error) {
    if (error instanceof GitHubConflictError)
      return NextResponse.json({ error: error.message }, { status: 409 });
    if (error instanceof GitHubConfigurationError)
      return NextResponse.json({ error: error.message }, { status: 503 });
    console.error("Portfolio content save failed", error);
    return NextResponse.json(
      {
        error:
          "Content could not be saved. Check the server configuration and try again.",
      },
      { status: 502 },
    );
  }
}
