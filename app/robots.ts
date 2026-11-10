import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] }],
    sitemap: new URL("/sitemap.xml", base).toString(),
  };
}
