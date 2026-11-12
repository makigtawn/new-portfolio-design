import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function NotFoundContent() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[70vh] w-[min(calc(100%-2.5rem),75rem)] flex-col justify-center py-24 md:w-[min(calc(100%-5rem),75rem)]"
    >
      <p className="eyebrow">404 / Page not found</p>
      <h1 className="mt-6 max-w-4xl text-[clamp(2.75rem,5.5vw,5.25rem)] leading-[1.1] font-normal tracking-[-0.07em]">
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
