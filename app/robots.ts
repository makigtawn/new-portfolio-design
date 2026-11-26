import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/src/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const publicBase = getPublicSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] }],
    ...(publicBase
      ? { sitemap: new URL("/sitemap.xml", publicBase).toString() }
      : {}),
  };
}
