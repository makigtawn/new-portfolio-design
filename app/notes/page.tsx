import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/src/lib/content/load";
import { slugFromTitle } from "@/src/lib/content/slug";
import { RevealHeading } from "@/components/layout/reveal-heading";

export const metadata: Metadata = {
  title: "Notes",
  description: "Short notes on building thoughtful software.",
};

export default function NotesPage() {
  const notes = getSiteContent().notes ?? [];
  if (!notes.length) notFound();
  return (
    <main
      id="main-content"
      className="page-shell min-h-[70vh] pt-16 pb-24 md:pt-24"
    >
      <p className="eyebrow">Writing / Field notes</p>
      <RevealHeading
        id="notes-heading"
        className="display-title mt-6 max-w-4xl"
        as="h1"
      >
        Notes from the work.
      </RevealHeading>
      <p className="text-muted mt-6 max-w-2xl text-lg">
        Short thoughts on useful tools, careful systems, and the details that
        make a product feel clear.
      </p>
      <ol className="border-line mt-16 border-t">
        {notes.map((note) => {
          const slug = slugFromTitle(note.title);
          return (
            <li key={slug} className="border-line border-b py-7 md:py-9">
              <Link
                href={`/notes/${slug}`}
                className="group grid gap-3 md:grid-cols-[9rem_1fr_auto] md:items-start md:gap-8"
              >
                <time className="eyebrow" dateTime={note.date}>
                  {new Date(`${note.date}T12:00:00`).toLocaleDateString("en", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <span>
                  <span className="group-hover:text-accent block text-xl tracking-tight md:text-2xl">
                    {note.title}
                  </span>
                  <span className="text-muted mt-2 block max-w-2xl text-sm">
                    {note.excerpt}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="text-accent hidden size-5 md:block"
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
