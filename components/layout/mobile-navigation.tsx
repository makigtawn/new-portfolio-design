"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MobileNavigation({ hasNotes }: { hasNotes: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
        onClick={() => setOpen((value) => !value)}
        className="rounded p-2 text-ink hover:bg-wash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
      </button>
      {open ? (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-full z-40 border-b border-line bg-paper px-5 py-4 shadow-sm">
          <ul className="mx-auto flex w-full max-w-[75rem] flex-col gap-1">
            {[["Work", "/#work"], ["About", "/#about"], ...(hasNotes ? [["Notes", "/notes"]] : []), ["Contact", "/#contact"]].map(([label, href]) => (
              <li key={href}>
                <Link href={href} onClick={close} className="block rounded px-3 py-3 text-sm text-ink hover:bg-wash focus-visible:outline-2 focus-visible:outline-accent">{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
