import type { MetadataRoute } from "next";
import { getSiteContent } from "@/src/lib/content/load";
import { slugFromTitle } from "@/src/lib/content/slug";
import { getSiteUrl } from "@/src/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const content = getSiteContent();
  const entries: MetadataRoute.Sitemap = [
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
  if (content.notes?.length) {
    entries.push({
      url: new URL("/notes", base).toString(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
    entries.push(
      ...content.notes.map((note) => ({
        url: new URL(`/notes/${slugFromTitle(note.title)}`, base).toString(),
        changeFrequency: "yearly" as const,
        priority: 0.5,
      })),
    );
  }
  return entries;
}
