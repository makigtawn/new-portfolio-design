export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || "https://example.dev";
  return new URL(configured);
}
