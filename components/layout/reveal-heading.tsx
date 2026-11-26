"use client";

import { useEffect, useRef, useState } from "react";

export function RevealHeading({
  children,
  className = "section-title",
  id,
  as = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: "h1" | "h2";
}) {
  const Heading = as;
  const ref = useRef<HTMLHeadingElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let observer: IntersectionObserver | null = null;
    const reveal = () => {
      setIsVisible(true);
      observer?.disconnect();
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("hashchange", checkPosition);
    };
    const checkPosition = () => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        reveal();
        return true;
      }
      return false;
    };

    const frame = requestAnimationFrame(() => {
      if (checkPosition()) return;
      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting || checkPosition()) {
              reveal();
            }
          },
          { threshold: 0.05 },
        );
        observer.observe(element);
      } else {
        reveal();
      }
    });

    window.addEventListener("scroll", checkPosition, { passive: true });
    window.addEventListener("hashchange", checkPosition);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("hashchange", checkPosition);
    };
  }, []);

  const visibility = isVisible ? "reveal-visible" : "reveal-ready";
  return (
    <Heading
      id={id}
      ref={ref}
      className={`${className} ${visibility} motion-reduce:transform-none motion-reduce:animate-none motion-reduce:opacity-100`}
    >
      {children}
    </Heading>
  );
}
