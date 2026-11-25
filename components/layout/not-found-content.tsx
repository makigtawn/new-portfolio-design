import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { getSiteContent } from "@/src/lib/content/load";

export function NotFoundContent() {
  const content = getSiteContent();

  return (
    <>
      <main
        id="main-content"
        className="mx-auto flex min-h-[calc(100svh-14rem)] w-[min(calc(100%-2.5rem),75rem)] flex-col justify-center py-20 md:w-[min(calc(100%-5rem),75rem)] md:py-24"
      >
        <p className="eyebrow">404 / Page not found</p>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.75rem,5.5vw,5.25rem)] leading-[1.1] font-normal tracking-[-0.07em]">
          This page took a different turn.
        </h1>
        <p className="text-muted mt-6 max-w-xl text-lg leading-relaxed">
          The link may have moved or no longer exists. Return home or explore
          selected work.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants()}>
            Back home
          </Link>
          <Link
            href="/#work"
            className={buttonVariants({ variant: "outline" })}
          >
            Selected work
          </Link>
        </div>
      </main>
      <SiteFooter profile={content.profile} />
    </>
  );
}
