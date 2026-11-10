"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";

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
      className="page-shell flex min-h-[70vh] flex-col justify-center py-24"
    >
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display-title mt-6 max-w-4xl">
        Let’s take another run at that.
      </h1>
      <p className="text-muted mt-6 max-w-xl">
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
