import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { RevealHeading } from "@/components/layout/reveal-heading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import type { SiteContent } from "@/src/lib/content/schema";

export function ServicesContact({ content }: { content: SiteContent }) {
  return (
    <>
      <section
        aria-labelledby="services-heading"
        className="page-shell section-space"
      >
        <div className="grid gap-7 md:grid-cols-[minmax(12rem,0.55fr)_1fr]">
          <p className="eyebrow">04 / Ways to work together</p>
          <div>
            <RevealHeading id="services-heading">
              Useful from first sketch to release.
            </RevealHeading>
            <p className="text-muted mt-5 max-w-2xl">
              Bring a focused problem, a rough idea, or a product that needs a
              steadier next step.
            </p>
          </div>
        </div>
        <ul className="mt-12 md:mt-16">
          {content.services.map((service, index) => (
            <li
              key={service.title}
              className="border-line grid gap-2 border-t py-6 md:grid-cols-[4rem_0.8fr_1.2fr] md:items-start md:gap-6"
            >
              <span className="eyebrow">0{index + 1}</span>
              <h3 className="text-lg font-normal tracking-tight">
                {service.title}
              </h3>
              <p className="text-muted max-w-xl text-sm leading-relaxed">
                {service.description}
              </p>
            </li>
          ))}
        </ul>
        <div className="border-accent mt-12 flex flex-col gap-4 border-l-2 pl-5 md:ml-[calc(4rem+1.5rem)] md:max-w-2xl">
          <p className="eyebrow">Availability</p>
          <p>{content.profile.availability}.</p>
          <p className="text-muted text-sm">
            Based in {content.profile.location}; comfortable collaborating
            across time zones.
          </p>
        </div>
      </section>
      <footer id="contact" className="bg-ink text-paper scroll-mt-20">
        <div className="page-shell py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-[1fr_15rem] md:items-end">
            <div>
              <p className="eyebrow text-paper/70">05 / Contact</p>
              <h2 className="mt-5 max-w-3xl text-4xl leading-tight font-normal tracking-[-0.07em] md:text-6xl">
                Have something useful to make?
              </h2>
              <p className="text-paper/75 mt-5 max-w-xl">
                Tell me what you are working through. A few clear details are a
                good place to begin.
              </p>
              <a
                className={cn(
                  buttonVariants(),
                  "border-paper bg-paper text-ink hover:border-accent hover:bg-accent hover:text-paper mt-8",
                )}
                href={`mailto:${content.profile.email}`}
              >
                <Mail aria-hidden="true" size={16} />
                {content.profile.email}
              </a>
            </div>
            <nav
              aria-label="Social links"
              className="text-paper/80 flex flex-col items-start gap-3 text-sm"
            >
              {content.profile.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-paper inline-flex items-center gap-2"
                >
                  {social.label}
                  <ArrowUpRight aria-hidden="true" size={14} />
                </a>
              ))}
              {content.notes?.length ? (
                <Link
                  href="/notes"
                  className="text-paper/70 hover:text-paper mt-3"
                >
                  Notes
                </Link>
              ) : null}
            </nav>
          </div>
          <div className="border-paper/20 text-paper/60 mt-16 flex flex-wrap justify-between gap-4 border-t pt-5 text-xs">
            <p>
              © {new Date().getFullYear()} {content.profile.name}
            </p>
            <a href="#main-content" className="hover:text-paper">
              Back to top ↑
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
