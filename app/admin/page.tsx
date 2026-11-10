import type { Metadata } from "next";
import { AdminEditor } from "@/components/admin/editor";
import { getSiteContent } from "@/src/lib/content/load";

export const metadata: Metadata = {
  title: "Content editor",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminEditor initialContent={getSiteContent()} />;
}
