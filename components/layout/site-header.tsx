import Link from "next/link";
import { getSiteContent } from "@/src/lib/content/load";

export function SiteHeader() {
  const content = getSiteContent();
  return (
    <header className="border-line mx-auto flex w-[min(calc(100%-2.5rem),75rem)] items-center justify-between border-b py-5 md:w-[min(calc(100%-5rem),75rem)]">
      <Link className="text-sm font-medium tracking-tight" href="/">
        {content.profile.name}
      </Link>
      <nav
        aria-label="Main navigation"
        className="text-muted flex items-center gap-5 text-sm"
      >
        <Link className="hover:text-ink" href="/#work">
          Work
        </Link>
        <Link className="hover:text-ink" href="/#about">
          About
        </Link>
        {content.notes?.length ? (
          <Link className="hover:text-ink hidden sm:inline" href="/notes">
            Notes
          </Link>
        ) : null}
        <Link className="hover:text-accent" href="/#contact">
          Contact
        </Link>
      </nav>
    </header>
  );
}
