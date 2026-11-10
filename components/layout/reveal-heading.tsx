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
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    setMounted(true);
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const visibility = mounted
    ? isVisible
      ? "is-visible"
      : "reveal-ready"
    : "";
  return (
    <Heading
      id={id}
      ref={ref}
      className={`${className} reveal-heading ${visibility}`}
    >
      {children}
    </Heading>
  );
}
