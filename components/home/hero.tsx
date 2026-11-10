import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { SiteContent } from "@/src/lib/content/schema";

export function Hero({ content }: { content: SiteContent }) {
  const lines = content.hero.headline.split("\n").filter(Boolean);

  return (
    <section
      aria-labelledby="hero-title"
      className="page-shell grid min-h-[calc(100svh-5rem)] items-center gap-12 py-20 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-16 md:py-28"
    >
      <div className="max-w-[59rem]">
        <p className="eyebrow hero-eyebrow">
          {content.profile.role} <span aria-hidden="true">·</span>{" "}
          {content.profile.location}
        </p>
        <h1 id="hero-title" className="display-title mt-8">
          {lines.map((line, index) => (
            <span className="hero-line" key={`${index}-${line}`}>
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <p className="hero-subline text-muted mt-8 max-w-[43rem] text-lg leading-relaxed md:text-xl">
          {content.hero.subline}
        </p>
        <div className="hero-ctas mt-8 flex flex-wrap items-center gap-3">
          <Link
            className={buttonVariants()}
            href={content.hero.primaryCta.href}
          >
            {content.hero.primaryCta.label}
            <ArrowDownRight aria-hidden="true" size={17} />
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={content.hero.secondaryCta.href}
          >
            {content.hero.secondaryCta.label}
          </Link>
        </div>
      </div>
      <aside className="hero-aside flex items-center gap-4 md:block md:self-end md:pb-2">
        <Image
          src={content.profile.photo.src}
          alt={content.profile.photo.alt}
          width={144}
          height={144}
          sizes="(max-width: 767px) 5rem, 9rem"
          priority
          className="border-line size-20 rounded-full border object-cover md:size-36"
        />
        <div className="max-w-56 md:mt-5">
          <p className="text-sm leading-relaxed">
            {content.profile.proofPoint}
          </p>
          <p className="eyebrow mt-3">{content.profile.availability}</p>
        </div>
      </aside>
    </section>
  );
}
