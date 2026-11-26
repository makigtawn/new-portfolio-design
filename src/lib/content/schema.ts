import { z } from "zod";

const httpUrl = z
  .string()
  .url()
  .refine((value) => /^https?:\/\//.test(value), {
    message: "Use a valid http or https URL.",
  });

export const linkSchema = z.object({
  label: z.string().trim().min(1),
  url: httpUrl,
});

export const imageSchema = z.object({
  src: z
    .string()
    .trim()
    .min(1)
    .refine(
      (value) =>
        value.startsWith("/") &&
        !value.startsWith("//") &&
        !value.split("/").includes(".."),
      { message: "Image paths must be safe public-root paths." },
    ),
  alt: z.string().trim().min(1, "Alt text is required."),
});

export const resumeSchema = z.object({
  label: z.string().trim().min(1),
  href: z
    .string()
    .trim()
    .min(1)
    .refine(
      (value) =>
        value.startsWith("/") &&
        !value.startsWith("//") &&
        !value.split("/").includes(".."),
      { message: "Resume paths must be safe public-root paths." },
    ),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  proofPoint: z.string().trim().min(1),
  bio: z.string().trim().min(1),
  location: z.string().trim().min(1),
  availability: z.string().trim().min(1),
  email: z.string().trim().email(),
  socials: z.array(linkSchema),
  photo: imageSchema,
  resume: resumeSchema.optional(),
});

export const ctaSchema = z.object({
  label: z.string().trim().min(1),
  href: z
    .string()
    .trim()
    .min(1)
    .refine(
      (value) =>
        value.startsWith("#") ||
        (value.startsWith("/") && !value.startsWith("//")) ||
        /^https?:\/\//.test(value),
      { message: "Use an on-site path, anchor, or http(s) URL." },
    ),
});

export const heroSchema = z.object({
  headline: z.string().trim().min(1),
  subline: z.string().trim().min(1),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
});

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  role: z.string().trim().min(1),
  stack: z.array(z.string().trim().min(1)).min(1),
  year: z.string().trim().min(1),
  problem: z.string().trim().min(1),
  approach: z.string().trim().min(1),
  outcome: z.string().trim().min(1),
  metric: z.string().trim().min(1).optional(),
  cover: imageSchema,
  links: z.array(linkSchema),
  featured: z.boolean(),
});

export const experienceSchema = z.object({
  company: z.string().trim().min(1),
  role: z.string().trim().min(1),
  period: z.string().trim().min(1),
  highlights: z.array(z.string().trim().min(1)).min(1),
});

export const educationSchema = z.object({
  institution: z.string().trim().min(1),
  program: z.string().trim().min(1),
  period: z.string().trim().min(1),
  highlights: z.array(z.string().trim().min(1)).optional(),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export const seoSchema = z.object({
  siteTitle: z.string().trim().min(1),
  description: z.string().trim().min(1),
  ogImage: imageSchema,
});

export const siteContentSchema = z
  .object({
    _comment: z.string().optional(),
    profile: profileSchema,
    hero: heroSchema,
    projects: z.array(projectSchema).min(1),
    experience: z.array(experienceSchema),
    education: z.array(educationSchema).optional(),
    services: z.array(serviceSchema),
    seo: seoSchema,
  })
  .superRefine((content, context) => {
    const slugs = content.projects.map((project) => project.slug);
    if (new Set(slugs).size !== slugs.length) {
      context.addIssue({
        code: "custom",
        path: ["projects"],
        message: "Project slugs must be unique.",
      });
    }
    if (!content.projects.some((project) => project.featured)) {
      context.addIssue({
        code: "custom",
        path: ["projects"],
        message: "Mark at least one project as featured.",
      });
    }
  });

export type SiteContent = z.infer<typeof siteContentSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Project = z.infer<typeof projectSchema>;

export function parseSiteContent(source: string): SiteContent {
  const value = JSON.parse(source.replace(/^\/\/[^\n]*\n/, "")) as unknown;
  return siteContentSchema.parse(value);
}
