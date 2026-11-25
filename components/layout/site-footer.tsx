import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import type { Profile } from "@/src/lib/content/schema";

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
              className="text-paper hover:text-accent mt-3 inline-flex min-h-10 items-center gap-2 text-base transition-colors"
            >
              <Mail aria-hidden="true" size={16} />
              {profile.email}
            </a>
          </div>
          <nav
            aria-label="Footer navigation"
            className="text-paper/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
          >
            <Link href="/#work" className="hover:text-paper py-1.5">
              Work
            </Link>
            <Link href="/#about" className="hover:text-paper py-1.5">
              About
            </Link>
            {profile.socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-paper inline-flex items-center gap-1.5 py-1.5"
              >
                {social.label}
                <ArrowUpRight aria-hidden="true" size={14} />
              </a>
            ))}
          </nav>
        </div>
        <div className="border-paper/20 text-paper/70 mt-10 flex flex-wrap justify-between gap-4 border-t pt-5 text-xs">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <a href="#main-content" className="hover:text-paper py-1">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
