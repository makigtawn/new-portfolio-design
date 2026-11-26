const localHostnames = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function parseHttpUrl(raw: string | undefined): URL | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

export function isPublicSiteUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return !localHostnames.has(host) && host !== "example.dev";
}

export function getPublicSiteUrl(): URL | null {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];
  for (const candidate of candidates) {
    const parsed = parseHttpUrl(candidate);
    if (parsed && isPublicSiteUrl(parsed)) return parsed;
  }
  return null;
}

export function getSiteUrl(): URL {
  const publicUrl = getPublicSiteUrl();
  if (publicUrl) return publicUrl;
  const configuredLocal = parseHttpUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (
    configuredLocal &&
    configuredLocal.hostname.toLowerCase() !== "example.dev" &&
    !process.env.VERCEL
  ) {
    return configuredLocal;
  }
  const port = process.env.PORT?.trim() || "3000";
  return new URL(`http://localhost:${port}`);
}
