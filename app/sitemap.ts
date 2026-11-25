import type { MetadataRoute } from "next";
import { getSiteContent } from "@/src/lib/content/load";
import { getSiteUrl } from "@/src/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const content = getSiteContent();
  return [
    {
      url: new URL("/", base).toString(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...content.projects.map((project) => ({
      url: new URL(`/work/${project.slug}`, base).toString(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
