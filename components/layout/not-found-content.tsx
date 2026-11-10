import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function NotFoundContent() {
  return (
    <main
      id="main-content"
      className="page-shell flex min-h-[70vh] flex-col justify-center py-24"
    >
      <p className="eyebrow">404 / Page not found</p>
      <h1 className="display-title mt-6 max-w-4xl">
        This page took a different turn.
      </h1>
      <p className="text-muted mt-6 max-w-xl text-lg">
        The link may have moved. You can return home and continue exploring.
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
