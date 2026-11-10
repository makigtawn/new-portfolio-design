import { RevealHeading } from "@/components/layout/reveal-heading";
import type { SiteContent } from "@/src/lib/content/schema";

export function Experience({ content }: { content: SiteContent }) {
  return (
    <section
      aria-labelledby="experience-heading"
      className="page-shell section-space"
    >
      <div className="grid gap-7 md:grid-cols-[minmax(12rem,0.55fr)_1fr]">
        <p className="eyebrow">03 / Experience</p>
        <div>
          <RevealHeading id="experience-heading">
            Learning by making.
          </RevealHeading>
          <p className="text-muted mt-5 max-w-xl">
            A short view of the work and practice behind these projects.
          </p>
        </div>
      </div>
      <ol className="mt-14 md:mt-20">
        {content.experience.map((entry) => (
          <li
            key={`${entry.company}-${entry.period}`}
            className="border-line grid gap-4 border-t py-7 md:grid-cols-[minmax(12rem,0.55fr)_1fr] md:gap-12 md:py-9"
          >
            <div>
              <p className="text-sm font-medium">{entry.company}</p>
              <p className="text-muted mt-1 text-sm">{entry.period}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-[minmax(10rem,0.7fr)_1.3fr] md:gap-8">
              <h3 className="text-lg font-normal tracking-tight">
                {entry.role}
              </h3>
              <ul className="text-muted space-y-2 text-sm leading-relaxed">
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
