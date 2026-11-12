import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealHeading } from "@/components/layout/reveal-heading";
import { ProjectMedia } from "@/components/home/project-media";
import type { SiteContent } from "@/src/lib/content/schema";

export function SelectedWork({ content }: { content: SiteContent }) {
  const projects = content.projects.filter((project) => project.featured);

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="section-space mx-auto w-[min(calc(100%-2.5rem),75rem)] scroll-mt-20 md:w-[min(calc(100%-5rem),75rem)]"
    >
      <div className="grid gap-6 md:grid-cols-[minmax(12rem,0.55fr)_1fr] md:items-end">
        <p className="eyebrow">01 / Selected work</p>
        <div>
          <RevealHeading id="work-heading">
            Small details. Useful outcomes.
          </RevealHeading>
          <p className="text-muted mt-5 max-w-2xl">
            A few projects exploring reliable systems, thoughtful interfaces,
            and better everyday workflows.
          </p>
        </div>
      </div>
      <div className="border-line mt-14 grid gap-10 border-t pt-8 md:mt-20 md:grid-cols-[minmax(12rem,0.55fr)_1fr] md:gap-12">
        <aside className="h-fit md:sticky md:top-24">
          <p className="eyebrow mb-5">Projects</p>
          <ol className="space-y-4">
            {projects.map((project, index) => (
              <li key={project.slug}>
                <Link
                  href={`/work/${project.slug}`}
                  className="group hover:text-accent flex items-start gap-3 text-sm"
                >
                  <span className="text-muted mt-0.5 text-xs">
                    0{index + 1}
                  </span>
                  <span>{project.title}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="ml-auto size-4 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ol>
          <p className="text-muted mt-8 max-w-64 text-sm leading-relaxed">
            Titles stay in view as each project moves through the work area.
          </p>
        </aside>
        <div className="space-y-16 md:space-y-24">
          {projects.map((project) => (
            <article key={project.slug} className="space-y-5">
              <Link href={`/work/${project.slug}`} className="group block">
                <ProjectMedia cover={project.cover} />
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">
                      {project.year} <span aria-hidden="true">·</span>{" "}
                      {project.role}
                    </p>
                    <h3 className="group-hover:text-accent mt-2 text-2xl font-normal tracking-tight md:text-3xl">
                      {project.title}
                    </h3>
                    <p className="text-muted mt-2 max-w-2xl text-sm md:text-base">
                      {project.summary}
                    </p>
                  </div>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="text-accent mt-1 size-5 shrink-0"
                  />
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
