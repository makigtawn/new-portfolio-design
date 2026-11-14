"use client";

import { motion, useScroll } from "motion/react";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      aria-hidden="true"
      className="progress-track bg-accent fixed inset-x-0 top-0 z-50 h-0.5 motion-reduce:hidden"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
