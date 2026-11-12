import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Something went wrong",
  robots: { index: false, follow: false },
};

export default function ErrorPage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[70vh] w-[min(calc(100%-2.5rem),75rem)] flex-col justify-center py-24 md:w-[min(calc(100%-5rem),75rem)]"
    >
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-6 max-w-4xl text-[clamp(2.75rem,5.5vw,5.25rem)] leading-[1.1] font-normal tracking-[-0.07em]">
        Let’s take another run at that.
      </h1>
      <p className="text-muted mt-6 max-w-xl">
        This part did not load as expected. Return home and start fresh.
      </p>
      <Link
        href="/"
        className="text-accent mt-8 inline-flex w-fit items-center gap-2 text-sm hover:underline"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        Back home
      </Link>
    </main>
  );
}
