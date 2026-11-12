import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/src/lib/content/load";
import { slugFromTitle } from "@/src/lib/content/slug";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return (getSiteContent().notes ?? []).map((note) => ({
    slug: slugFromTitle(note.title),
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = (getSiteContent().notes ?? []).find(
    (item) => slugFromTitle(item.title) === slug,
  );
  return note
    ? { title: note.title, description: note.excerpt }
    : { title: "Note not found" };
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params;
  const note = (getSiteContent().notes ?? []).find(
    (item) => slugFromTitle(item.title) === slug,
  );
  if (!note) notFound();
  return (
    <main
      id="main-content"
      className="mx-auto min-h-[70vh] w-[min(calc(100%-2.5rem),75rem)] pt-12 pb-24 md:w-[min(calc(100%-5rem),75rem)] md:pt-20"
    >
      <Link
        href="/notes"
        className="text-muted hover:text-accent inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        All notes
      </Link>
      <article className="mx-auto mt-14 max-w-3xl md:mt-20">
        <p className="eyebrow">
          <time dateTime={note.date}>
            {new Date(`${note.date}T12:00:00`).toLocaleDateString("en", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>{" "}
          · Note
        </p>
        <h1 className="mt-5 text-4xl leading-tight font-normal tracking-[-0.07em] md:text-6xl">
          {note.title}
        </h1>
        <p className="text-muted mt-7 text-xl leading-relaxed">
          {note.excerpt}
        </p>
        <div className="border-line mt-12 space-y-5 border-t pt-8 text-base leading-relaxed md:text-lg">
          {note.body.split("\n\n").map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
