import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  return <NotFoundContent />;
}
