"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/src/lib/content/schema";

export function ProjectMedia({ cover }: { cover: Project["cover"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.68, 1, 1, 0.68],
  );
  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);

  useEffect(() => setMounted(true), []);

  return (
    <motion.div
      ref={ref}
      style={mounted ? { opacity, scale } : undefined}
      className="project-media-initial border-line bg-wash relative overflow-hidden rounded-md border motion-reduce:!scale-100 motion-reduce:!opacity-100"
    >
      <Image
        src={cover.src}
        alt={cover.alt}
        width={1200}
        height={900}
        sizes="(max-width: 767px) 100vw, 68vw"
        className="h-auto w-full"
      />
    </motion.div>
  );
}
