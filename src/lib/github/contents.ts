import { parseSiteContent, type SiteContent } from "@/src/lib/content/schema";

const apiRoot = (
  process.env.GITHUB_API_URL ?? "https://api.github.com"
).replace(/\/+$/, "");
const githubApiVersion = "2022-11-28";

export class GitHubConflictError extends Error {
  constructor() {
    super(
      "The content changed on GitHub before this save completed. Reload the latest version and apply your edits again.",
    );
    this.name = "GitHubConflictError";
  }
}

export class GitHubConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubConfigurationError";
  }
}

type GitHubConfig = { token: string; repo: string; branch: string };
type Fetcher = typeof fetch;

function getGitHubConfig(): GitHubConfig {
  const { GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_BRANCH) {
    throw new GitHubConfigurationError(
      "GitHub save is not configured. Set GITHUB_TOKEN, GITHUB_REPO, and GITHUB_BRANCH.",
    );
  }
  if (!/^[^/]+\/[^/]+$/.test(GITHUB_REPO)) {
    throw new GitHubConfigurationError(
      "GITHUB_REPO must use the owner/repository format.",
    );
  }
  return { token: GITHUB_TOKEN, repo: GITHUB_REPO, branch: GITHUB_BRANCH };
}

function requestHeaders(token: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": githubApiVersion,
    "Content-Type": "application/json",
  };
}

type GitHubFile = { sha: string; content?: string; encoding?: string };

async function getFile(
  path: string,
  config: GitHubConfig,
  fetcher: Fetcher,
): Promise<GitHubFile | undefined> {
  const url = new URL(`${apiRoot}/repos/${config.repo}/contents/${path}`);
  url.searchParams.set("ref", config.branch);
  const response = await fetcher(url, {
    headers: requestHeaders(config.token),
    cache: "no-store",
  });
  if (response.status === 404) return undefined;
  if (!response.ok)
    throw new Error(`GitHub could not read ${path} (HTTP ${response.status}).`);
  const body = (await response.json()) as GitHubFile;
  if (!body.sha) throw new Error("GitHub did not return a content SHA.");
  return body;
}

async function putFile(
  path: string,
  contentBase64: string,
  message: string,
  sha: string | undefined,
  config: GitHubConfig,
  fetcher: Fetcher,
): Promise<{ sha: string }> {
  const response = await fetcher(
    `${apiRoot}/repos/${config.repo}/contents/${path}`,
    {
      method: "PUT",
      headers: requestHeaders(config.token),
      body: JSON.stringify({
        message,
        content: contentBase64,
        branch: config.branch,
        ...(sha ? { sha } : {}),
      }),
      cache: "no-store",
    },
  );
  if (response.status === 409 || response.status === 422)
    throw new GitHubConflictError();
  if (!response.ok)
    throw new Error(`GitHub could not save ${path} (HTTP ${response.status}).`);
  const body = (await response.json()) as { content?: { sha?: string } };
  return { sha: body.content?.sha ?? "" };
}

export function serializeContentWithPlaceholderNote(
  content: SiteContent,
): string {
  const committed = {
    ...content,
    _comment:
      content._comment ??
      "PLACEHOLDER CONTENT: Replace any remaining sample details and unverified demo metrics before publishing.",
  };
  return `${JSON.stringify(committed, null, 2)}\n`;
}

export async function commitSiteContentToGitHub(
  content: SiteContent,
  expectedContent: SiteContent,
  fetcher: Fetcher = fetch,
): Promise<{ sha: string }> {
  const config = getGitHubConfig();
  const path = "content/site.json";
  const currentFile = await getFile(path, config, fetcher);
  if (!currentFile || currentFile.encoding !== "base64" || !currentFile.content)
    throw new GitHubConflictError();

  const remoteText = Buffer.from(
    currentFile.content.replace(/\s/g, ""),
    "base64",
  ).toString("utf8");
  const remoteContent = parseSiteContent(remoteText);
  if (JSON.stringify(remoteContent) !== JSON.stringify(expectedContent)) {
    throw new GitHubConflictError();
  }

  const base64 = Buffer.from(
    serializeContentWithPlaceholderNote(content),
    "utf8",
  ).toString("base64");
  return putFile(
    path,
    base64,
    "Update portfolio content",
    currentFile.sha,
    config,
    fetcher,
  );
}

export async function commitUploadToGitHub(
  path: string,
  bytes: Uint8Array,
  fetcher: Fetcher = fetch,
): Promise<{ sha: string }> {
  const config = getGitHubConfig();
  if (!/^public\/uploads\/[a-f0-9-]+\.(?:jpg|png|webp)$/.test(path)) {
    throw new Error("Upload path is not valid.");
  }
  return putFile(
    path,
    Buffer.from(bytes).toString("base64"),
    "Add portfolio image",
    undefined,
    config,
    fetcher,
  );
}
