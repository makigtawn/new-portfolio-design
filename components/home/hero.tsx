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
      className="mx-auto grid min-h-[calc(100svh-5rem)] w-[min(calc(100%-2.5rem),75rem)] items-center gap-12 py-20 md:w-[min(calc(100%-5rem),75rem)] md:grid-cols-[minmax(0,1fr)_15rem] md:gap-16 md:py-28"
    >
      <div className="max-w-[59rem]">
        <p className="eyebrow animate-[hero-follow_650ms_cubic-bezier(0.22,1,0.36,1)_90ms_both] motion-reduce:animate-none">
          {content.profile.role} <span aria-hidden="true">·</span>{" "}
          {content.profile.location}
        </p>
        <h1
          id="hero-title"
          className="mt-8 text-[clamp(2.75rem,5.5vw,5.25rem)] leading-[1.1] font-normal tracking-[-0.07em]"
        >
          {lines.map((line, index) => (
            <span
              className={`hero-line ${index === 1 ? "[&>span]:[animation-delay:90ms]" : ""}`}
              key={`${index}-${line}`}
            >
              <span className="block animate-[hero-rise_650ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none">
                {line}
              </span>
            </span>
          ))}
        </h1>
        <p className="text-muted mt-8 max-w-[43rem] animate-[hero-follow_650ms_cubic-bezier(0.22,1,0.36,1)_240ms_both] text-lg leading-relaxed motion-reduce:animate-none md:text-xl">
          {content.hero.subline}
        </p>
        <div className="mt-8 flex animate-[hero-follow_650ms_cubic-bezier(0.22,1,0.36,1)_340ms_both] flex-wrap items-center gap-3 motion-reduce:animate-none">
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
      <aside className="flex animate-[hero-follow_650ms_cubic-bezier(0.22,1,0.36,1)_420ms_both] items-center gap-4 motion-reduce:animate-none md:block md:self-end md:pb-2">
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
