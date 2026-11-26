import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { getSiteContent } from "@/src/lib/content/load";
import { getPublicSiteUrl } from "@/src/lib/site-url";
import { cn } from "@/src/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

function isRasterImagePath(src: string): boolean {
  return /\.(png|jpe?g|webp|avif)$/i.test(src);
}

export function generateStaticParams() {
  return getSiteContent().projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = getSiteContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) return { title: "Project not found" };
  const publicUrl = getPublicSiteUrl();
  const socialImage = isRasterImagePath(project.cover.src)
    ? { url: project.cover.src, alt: project.cover.alt }
    : {
        url: content.seo.ogImage.src,
        alt: `${project.title} · ${content.profile.name}`,
      };
  return {
    title: `${project.title} - Case study`,
    description: project.summary,
    ...(publicUrl
      ? { alternates: { canonical: `/work/${project.slug}` } }
      : {}),
    openGraph: {
      title: `${project.title} - Case study`,
      description: project.summary,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} - Case study`,
      description: project.summary,
      images: [socialImage],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const content = getSiteContent();
  const index = content.projects.findIndex((project) => project.slug === slug);
  if (index < 0) notFound();
  const project = content.projects[index];
  const hasAdjacentProjects = content.projects.length > 1;
  const previous =
    content.projects[
      (index - 1 + content.projects.length) % content.projects.length
    ];
  const next = content.projects[(index + 1) % content.projects.length];

  return (
    <>
      <main
        id="main-content"
        className="mx-auto w-[min(calc(100%-2.5rem),75rem)] pb-24 md:w-[min(calc(100%-5rem),75rem)]"
      >
        <div className="pt-10 md:pt-16">
          <Link
            href="/#work"
            className="text-muted hover:text-accent inline-flex min-h-11 items-center gap-2 py-2 text-sm transition-colors"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Selected work
          </Link>
          <div className="mt-10 grid gap-8 md:mt-16 md:grid-cols-[1fr_17rem] md:items-end">
            <div>
              <p className="eyebrow">
                Case study <span aria-hidden="true">·</span> {project.year}
              </p>
              <h1 className="mt-5 max-w-4xl text-[clamp(2.75rem,5.5vw,5.25rem)] leading-[1.1] font-normal tracking-[-0.07em]">
                {project.title}
              </h1>
            </div>
            <p className="text-muted max-w-sm">{project.summary}</p>
          </div>
          <div className="border-line bg-wash mt-12 overflow-hidden rounded-md border md:mt-16">
            <Image
              src={project.cover.src}
              alt={project.cover.alt}
              width={1200}
              height={900}
              priority
              sizes="(max-width: 767px) 100vw, 75rem"
              className="h-auto w-full"
            />
          </div>
          <p className="text-muted mt-5 text-sm">{project.role}</p>
        </div>

        <div className="border-line mt-16 grid gap-12 border-t pt-12 md:mt-24 md:grid-cols-[minmax(12rem,0.55fr)_1fr] md:gap-14">
          <aside className="space-y-10">
            <div>
              <h2 className="text-muted text-sm font-medium tracking-[0.11em] uppercase">
                Stack
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <li
                    key={item}
                    className="border-line text-muted rounded border px-2.5 py-1 text-xs"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {project.links.length ? (
              <div>
                <h2 className="text-muted text-sm font-medium tracking-[0.11em] uppercase">
                  Links
                </h2>
                <ul className="mt-3 space-y-2">
                  {project.links.map((link) => (
                    <li key={link.url}>
                      <a
                        className="text-accent inline-flex min-h-11 items-center gap-2 py-1 text-sm hover:underline"
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label}
                        <ArrowUpRight aria-hidden="true" size={15} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
          <div className="space-y-12 md:space-y-16">
            <section aria-labelledby="problem-heading">
              <h2
                id="problem-heading"
                className="text-muted text-sm font-medium tracking-[0.11em] uppercase"
              >
                The problem
              </h2>
              <p className="mt-4 max-w-3xl text-xl leading-relaxed tracking-tight md:text-2xl">
                {project.problem}
              </p>
            </section>
            <section aria-labelledby="approach-heading">
              <h2
                id="approach-heading"
                className="text-muted text-sm font-medium tracking-[0.11em] uppercase"
              >
                The approach
              </h2>
              <p className="text-muted mt-4 max-w-3xl leading-relaxed">
                {project.approach}
              </p>
            </section>
            <section aria-labelledby="outcome-heading">
              <h2
                id="outcome-heading"
                className="text-muted text-sm font-medium tracking-[0.11em] uppercase"
              >
                The outcome
              </h2>
              <p className="mt-4 max-w-3xl leading-relaxed">
                {project.outcome}
              </p>
              {project.metric ? (
                <p className="border-accent text-muted mt-6 max-w-2xl border-l-2 pl-4 text-sm">
                  {project.metric}
                </p>
              ) : null}
            </section>
          </div>
        </div>

        {hasAdjacentProjects ? (
          <nav
            aria-label="Other case studies"
            className="border-line mt-20 grid gap-4 border-t pt-6 md:mt-28 md:grid-cols-2"
          >
            <Link
              href={`/work/${previous.slug}`}
              className="group border-line hover:bg-wash rounded-md border p-5 transition-colors"
            >
              <span className="eyebrow inline-flex items-center gap-2">
                <ArrowLeft aria-hidden="true" size={14} />
                Previous
              </span>
              <span className="group-hover:text-accent mt-3 block text-lg transition-colors">
                {previous.title}
              </span>
            </Link>
            <Link
              href={`/work/${next.slug}`}
              className="group border-line hover:bg-wash rounded-md border p-5 text-left transition-colors md:text-right"
            >
              <span className="eyebrow inline-flex items-center gap-2">
                Next
                <ArrowRight aria-hidden="true" size={14} />
              </span>
              <span className="group-hover:text-accent mt-3 block text-lg transition-colors">
                {next.title}
              </span>
            </Link>
          </nav>
        ) : null}
        <div className="mt-12">
          <Link
            href="/#contact"
            className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
          >
            Discuss a similar project
          </Link>
        </div>
      </main>
      <SiteFooter profile={content.profile} />
    </>
  );
}
