import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import type { Profile } from "@/src/lib/content/schema";

export function FooterBottom({
  name,
  className = "mt-10",
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`border-paper/20 text-paper/70 flex flex-wrap items-center justify-between gap-4 border-t pt-4 text-xs ${className}`}
    >
      <p>
        © {new Date().getFullYear()} {name}
      </p>
      <a
        href="#top"
        className="hover:text-paper inline-flex min-h-11 items-center py-1"
      >
        Back to top ↑
      </a>
    </div>
  );
}

export function SiteFooter({
  profile,
}: {
  profile: Pick<Profile, "name" | "email" | "socials">;
}) {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto w-[min(calc(100%-2.5rem),75rem)] py-12 md:w-[min(calc(100%-5rem),75rem)] md:py-16">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="eyebrow text-paper/75">Get in touch</p>
            <a
              href={`mailto:${profile.email}`}
              className="text-paper hover:text-accent mt-2 inline-flex min-h-11 items-center gap-2 text-base transition-colors"
            >
              <Mail aria-hidden="true" size={16} />
              {profile.email}
            </a>
          </div>
          <nav
            aria-label="Footer navigation"
            className="text-paper/80 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm"
          >
            <Link
              href="/#work"
              className="hover:text-paper inline-flex min-h-11 items-center py-1.5"
            >
              Work
            </Link>
            <Link
              href="/#about"
              className="hover:text-paper inline-flex min-h-11 items-center py-1.5"
            >
              About
            </Link>
            {profile.socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-paper inline-flex min-h-11 min-w-11 items-center gap-1.5 py-1.5"
              >
                {social.label}
                <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            ))}
          </nav>
        </div>
        <FooterBottom name={profile.name} />
      </div>
    </footer>
  );
}
