import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main
      id="main-content"
      className="page-shell flex min-h-[75vh] items-center py-16"
    >
      <div className="w-full max-w-md">
        <p className="eyebrow">Private / Content editor</p>
        <h1 className="mt-5 text-4xl font-normal tracking-[-0.07em] md:text-5xl">
          Sign in to edit.
        </h1>
        <p className="text-muted mt-4">
          Use the admin password configured for this site.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
