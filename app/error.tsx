"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[calc(100svh-5.25rem)] w-[min(calc(100%-2.5rem),75rem)] flex-col justify-center py-20 md:w-[min(calc(100%-5rem),75rem)] md:py-24"
    >
      <p className="eyebrow">Error / Something went wrong</p>
      <h1 className="mt-6 max-w-4xl text-[clamp(2.75rem,5.5vw,5.25rem)] leading-[1.1] font-normal tracking-[-0.07em]">
        Let’s take another run at that.
      </h1>
      <p className="text-muted mt-6 max-w-xl text-lg leading-relaxed">
        This part did not load as expected. Try again or return to the home
        page.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back home
        </Link>
      </div>
    </main>
  );
}
