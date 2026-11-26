"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  {
    label: "Work",
    href: "/#work",
    match: (path: string) => path.startsWith("/work"),
  },
  { label: "About", href: "/#about", match: () => false },
  { label: "Contact", href: "/#contact", match: () => false },
] as const;

function isPopoverOpen(element: HTMLElement): boolean {
  try {
    return element.matches(":popover-open");
  } catch {
    return element.classList.contains(":popover-open");
  }
}

export function MobileNavigation({ brandName }: { brandName: string }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;
    const media = window.matchMedia("(min-width: 48rem)");
    const syncLayout = () => {
      if (media.matches) {
        if (isPopoverOpen(menu)) {
          menu.hidePopover?.();
        }
        menu.removeAttribute("popover");
        setOpen(false);
      } else {
        menu.setAttribute("popover", "auto");
      }
    };
    syncLayout();
    media.addEventListener("change", syncLayout);
    return () => media.removeEventListener("change", syncLayout);
  }, []);

  const toggleFallback = () => {
    const menu = menuRef.current;
    if (!menu) return;
    if (
      typeof HTMLElement !== "undefined" &&
      Object.hasOwn(HTMLElement.prototype, "popover")
    ) {
      return;
    }
    const nextOpen = !open;
    menu.classList.toggle(":popover-open", nextOpen);
    setOpen(nextOpen);
  };

  const closeMenu = () => {
    const menu = menuRef.current;
    if (menu && isPopoverOpen(menu)) {
      menu.hidePopover?.();
    }
    menu?.classList.remove(":popover-open");
    setOpen(false);
  };

  return (
    <>
      <Link
        href="/"
        aria-current={pathname === "/" ? "page" : undefined}
        className="inline-flex min-h-11 items-center rounded text-sm font-medium tracking-tight"
      >
        {brandName}
      </Link>
      <nav aria-label="Primary">
        <button
          type="button"
          popoverTarget="site-menu"
          popoverTargetAction="toggle"
          aria-controls="site-menu"
          aria-expanded={open}
          onClick={toggleFallback}
          className="menu-button text-ink hover:bg-wash inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors md:hidden"
        >
          {open ? (
            <X aria-hidden="true" size={18} />
          ) : (
            <Menu aria-hidden="true" size={18} />
          )}
          <span>Menu</span>
        </button>
        <ul
          id="site-menu"
          ref={menuRef}
          popover="auto"
          onToggle={(event) => setOpen(event.newState === "open")}
          className="site-menu"
        >
          {navItems.map((item) => {
            const isCurrentSection = item.match(pathname);
            const isContact = item.label === "Contact";
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={isCurrentSection ? "true" : undefined}
                  className={`flex min-h-11 items-center rounded-md px-3 py-2 text-sm transition-colors md:px-1.5 md:py-1 ${
                    isCurrentSection
                      ? "text-ink decoration-accent font-medium underline decoration-2 underline-offset-4"
                      : isContact
                        ? "text-ink hover:bg-wash md:text-muted md:hover:text-accent md:hover:bg-transparent"
                        : "text-ink hover:bg-wash md:text-muted md:hover:text-ink md:hover:bg-transparent"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
