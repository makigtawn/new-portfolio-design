"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  password: z.string().min(1, "Enter the admin password.").max(256),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  const submit = handleSubmit(async ({ password }) => {
    setServerError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setServerError(
          result.error ??
            "Unable to sign in. Check the password and try again.",
        );
        return;
      }
      const returnTo = new URLSearchParams(window.location.search).get(
        "returnTo",
      );
      const destination =
        returnTo?.startsWith("/admin") && returnTo !== "/admin/login"
          ? returnTo
          : "/admin";
      router.replace(destination);
      router.refresh();
    } catch {
      setServerError("Unable to sign in. Check the password and try again.");
    }
  });

  return (
    <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
      <div>
        <label
          htmlFor="admin-password"
          className="mb-2 block text-sm font-medium"
        >
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="done"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "admin-password-error" : undefined
            }
            className="field-control placeholder-muted pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-pressed={showPassword}
            aria-label={showPassword ? "Hide characters" : "Show characters"}
            className="text-muted hover:text-ink absolute inset-y-1 right-1 inline-flex min-w-10 items-center justify-center rounded px-2 transition-colors"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </button>
        </div>
        {errors.password ? (
          <p id="admin-password-error" className="text-accent mt-2 text-sm">
            {errors.password.message}
          </p>
        ) : null}
      </div>
      {serverError ? (
        <p role="alert" className="text-accent text-sm">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
