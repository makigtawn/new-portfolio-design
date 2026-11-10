"use client";

import { motion, useScroll } from "motion/react";
import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => setMounted(true), []);

  return (
    <motion.div
      aria-hidden="true"
      className="progress-track bg-accent fixed inset-x-0 top-0 z-50 h-0.5"
      style={mounted ? { scaleX: scrollYProgress } : undefined}
    />
  );
}
