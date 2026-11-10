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
      className="page-shell flex min-h-[70vh] flex-col justify-center py-24"
    >
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display-title mt-6 max-w-4xl">
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
