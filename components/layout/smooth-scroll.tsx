"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    const syncPreference = () => {
      if (reduceMotion.matches) {
        lenis?.destroy();
        lenis = null;
      } else if (!lenis) {
        lenis = new Lenis({ autoRaf: true, smoothWheel: true });
      }
    };
    syncPreference();
    reduceMotion.addEventListener("change", syncPreference);

    return () => {
      reduceMotion.removeEventListener("change", syncPreference);
      lenis?.destroy();
    };
  }, []);

  return null;
}
