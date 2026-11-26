import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const required = [
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "GITHUB_TOKEN",
  "GITHUB_REPO",
  "GITHUB_BRANCH",
];
const missingEnv = required.filter(
  (key) =>
    !process.env[key] ||
    /^(replace-|owner\/repository|test-token)/i.test(process.env[key]),
);
const markers = [
  /PLACEHOLDER/i,
  /example\.com/i,
  /example\.dev/i,
  /your-handle/i,
  /evaluation pending/i,
  /\bTODO\b/i,
  /lorem/i,
  /placeholder\.jpg/i,
];
const siteUrlRaw =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "");
let invalidSiteUrl = false;
try {
  const parsed = new URL(siteUrlRaw);
  const host = parsed.hostname.toLowerCase();
  invalidSiteUrl =
    (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]" ||
    host === "example.dev";
} catch {
  invalidSiteUrl = true;
}
if (invalidSiteUrl) {
  missingEnv.push("NEXT_PUBLIC_SITE_URL");
}
const findings = [];

async function scan(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await scan(path);
    else {
      const ext = entry.name.toLowerCase().split(".").pop();
      if (["json", "svg", "png", "jpg", "jpeg", "webp", "avif"].includes(ext)) {
        const text = await readFile(path, "utf8").catch(() => "");
        for (const marker of markers)
          if (marker.test(text)) findings.push(`${path}: matched ${marker}`);
      }
    }
  }
}
await scan(join(root, "content"));
await scan(join(root, "public"));
if (missingEnv.length || findings.length) {
  console.error("Launch check failed.");
  if (missingEnv.length)
    console.error(
      `Missing production environment variables: ${missingEnv.join(", ")}`,
    );
  if (findings.length)
    console.error(`Placeholder markers found:\n${findings.join("\n")}`);
  process.exitCode = 1;
} else
  console.log(
    "Launch check passed: required production variables are set and no placeholder markers were found.",
  );
