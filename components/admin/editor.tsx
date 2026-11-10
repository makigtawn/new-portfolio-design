"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  experienceSchema,
  heroSchema,
  noteSchema,
  profileSchema,
  projectSchema,
  seoSchema,
  serviceSchema,
  siteContentSchema,
  type SiteContent,
} from "@/src/lib/content/schema";

const sectionDefinitions = [
  {
    key: "profile",
    title: "Profile",
    description: "Your name, role, contact details, social links, and photo.",
    schema: profileSchema,
  },
  {
    key: "hero",
    title: "Hero",
    description: "The first headline, subline, and two calls to action.",
    schema: heroSchema,
  },
  {
    key: "projects",
    title: "Projects",
    description:
      "Case studies, cover images, stack, and links. Include alt text for each cover.",
    schema: z.array(projectSchema),
  },
  {
    key: "experience",
    title: "Experience",
    description: "Roles and the work you want clients to understand.",
    schema: z.array(experienceSchema),
  },
  {
    key: "services",
    title: "Services",
    description: "Ways clients can work with you.",
    schema: z.array(serviceSchema),
  },
  {
    key: "notes",
    title: "Notes",
    description:
      "Short writeups. Remove this section’s entries to hide notes from navigation.",
    schema: z.array(noteSchema),
  },
  {
    key: "seo",
    title: "SEO",
    description:
      "Site title, description, and social preview image with alt text.",
    schema: seoSchema,
  },
] as const;

type SectionKey = (typeof sectionDefinitions)[number]["key"];
type SectionFormValues = { json: string };
type SectionEditorProps = {
  section: (typeof sectionDefinitions)[number];
  value: string;
  onChange: (key: SectionKey, value: string) => void;
};

function SectionEditor({ section, value, onChange }: SectionEditorProps) {
  const fieldSchema = useMemo(
    () =>
      z.object({
        json: z.string().superRefine((raw, context) => {
          let parsed: unknown;
          try {
            parsed = JSON.parse(raw) as unknown;
          } catch {
            context.addIssue({
              code: "custom",
              message: "Enter valid JSON for this section.",
            });
            return;
          }
          const result = section.schema.safeParse(parsed);
          if (!result.success) {
            const first = result.error.issues[0];
            context.addIssue({
              code: "custom",
              message: first
                ? `${first.path.join(".") || "value"}: ${first.message}`
                : "This section is not valid.",
            });
          }
        }),
      }),
    [section],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    getValues,
  } = useForm<SectionFormValues>({
    resolver: zodResolver(fieldSchema) as Resolver<SectionFormValues>,
    defaultValues: { json: value },
    mode: "onChange",
  });
  const [validated, setValidated] = useState(false);
  const field = register("json");

  useEffect(() => {
    if (getValues("json") !== value) reset({ json: value });
  }, [getValues, reset, value]);

  return (
    <form
      className="admin-prose"
      onSubmit={handleSubmit(
        () => setValidated(true),
        () => setValidated(false),
      )}
    >
      <p className="text-muted mb-4 max-w-2xl text-sm">
        {section.description} Edit this section as JSON; validate it before
        saving.
      </p>
      <label htmlFor={`section-${section.key}`} className="sr-only">
        {section.title} content as JSON
      </label>
      <textarea
        {...field}
        id={`section-${section.key}`}
        className="field-control min-h-64"
        spellCheck={false}
        aria-invalid={Boolean(errors.json)}
        aria-describedby={
          errors.json
            ? `section-${section.key}-error`
            : `section-${section.key}-help`
        }
        onChange={(event) => {
          field.onChange(event);
          setValidated(false);
          onChange(section.key, event.currentTarget.value);
        }}
      />
      <p id={`section-${section.key}-help`} className="text-muted mt-2 text-xs">
        Keep keys and quote marks intact. Text values can be edited freely.
      </p>
      {errors.json ? (
        <p
          id={`section-${section.key}-error`}
          role="alert"
          className="text-accent mt-3 text-sm"
        >
          {errors.json.message}
        </p>
      ) : null}
      {validated && !errors.json ? (
        <p role="status" className="text-muted mt-3 text-sm">
          Section is valid.
        </p>
      ) : null}
      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" variant="outline" size="sm">
          Validate section
        </Button>
        {isDirty ? (
          <span className="text-muted text-xs">Unsaved changes</span>
        ) : null}
      </div>
    </form>
  );
}

function serializeSections(content: SiteContent): Record<SectionKey, string> {
  return Object.fromEntries(
    sectionDefinitions.map(({ key }) => [
      key,
      JSON.stringify(content[key] ?? [], null, 2),
    ]),
  ) as Record<SectionKey, string>;
}

export function AdminEditor({
  initialContent,
}: {
  initialContent: SiteContent;
}) {
  const router = useRouter();
  const original = useMemo(
    () => serializeSections(initialContent),
    [initialContent],
  );
  const [baseContent, setBaseContent] = useState(initialContent);
  const [draft, setDraft] = useState<Record<SectionKey, string>>(original);
  const [saved, setSaved] = useState<Record<SectionKey, string>>(original);
  const [status, setStatus] = useState<{
    kind: "saved" | "error" | "idle";
    message: string;
  }>({ kind: "idle", message: "" });
  const [saving, setSaving] = useState(false);
  const dirty = sectionDefinitions.some(({ key }) => draft[key] !== saved[key]);

  const updateDraft = useCallback((key: SectionKey, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setStatus({ kind: "idle", message: "" });
  }, []);

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const guardInternalLinks = (event: MouseEvent) => {
      if (
        !dirty ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin === window.location.origin &&
        destination.pathname === window.location.pathname
      )
        return;
      if (
        !window.confirm(
          "You have unsaved edits. Leave this page and discard them?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warnBeforeLeave);
    document.addEventListener("click", guardInternalLinks, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeave);
      document.removeEventListener("click", guardInternalLinks, true);
    };
  }, [dirty]);

  async function saveContent() {
    setStatus({ kind: "idle", message: "" });
    const merged: Record<string, unknown> = { ...baseContent };
    for (const { key } of sectionDefinitions) {
      try {
        merged[key] = JSON.parse(draft[key]) as unknown;
      } catch {
        setStatus({
          kind: "error",
          message: `The ${key} section contains invalid JSON. Correct it before saving.`,
        });
        return;
      }
    }
    const parsed = siteContentSchema.safeParse(merged);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setStatus({
        kind: "error",
        message: firstIssue
          ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
          : "Content validation failed.",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedContent: baseContent,
          content: parsed.data,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus({
          kind: "error",
          message: result.error ?? "Content could not be saved.",
        });
        return;
      }
      const next = serializeSections(parsed.data);
      setBaseContent(parsed.data);
      setSaved(next);
      setDraft(next);
      setStatus({
        kind: "saved",
        message:
          "Saved to GitHub. The public site updates after its deployment finishes.",
      });
    } catch {
      setStatus({
        kind: "error",
        message:
          "Content could not be saved. Check your connection and try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    if (
      dirty &&
      !window.confirm("You have unsaved edits. Sign out and discard them?")
    ) {
      return;
    }
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main
      id="main-content"
      className="page-shell min-h-[80vh] pt-10 pb-24 md:pt-16"
    >
      <div className="border-line flex flex-wrap items-start justify-between gap-6 border-b pb-7">
        <div>
          <p className="eyebrow">Private / Portfolio content</p>
          <h1 className="mt-3 text-4xl font-normal tracking-[-0.07em] md:text-5xl">
            Content editor
          </h1>
          <p className="text-muted mt-3 max-w-2xl text-sm">
            Edit a section, validate it, then save all changes to the configured
            GitHub branch.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="border-line hover:bg-wash inline-flex min-h-10 items-center rounded-md border px-3 text-sm"
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            Preview public site
          </Link>
          <Button type="button" variant="outline" onClick={() => void logout()}>
            Sign out
          </Button>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p
          aria-live="polite"
          role={status.kind === "error" ? "alert" : "status"}
          className={`text-sm ${status.kind === "error" ? "text-accent" : "text-muted"}`}
        >
          {status.message || (dirty ? "Unsaved edits" : "All edits saved")}
        </p>
        <Button
          type="button"
          onClick={() => void saveContent()}
          disabled={saving || !dirty}
        >
          {saving ? "Saving…" : "Save all changes"}
        </Button>
      </div>
      <Accordion type="multiple" defaultValue={["profile"]} className="mt-6">
        {sectionDefinitions.map((section) => (
          <AccordionItem key={section.key} value={section.key}>
            <AccordionTrigger>
              <span>{section.title}</span>
              <span className="text-muted mr-3 ml-auto text-xs">
                {draft[section.key] !== saved[section.key] ? "Edited" : ""}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <SectionEditor
                section={section}
                value={draft[section.key]}
                onChange={updateDraft}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <ImageUpload />
    </main>
  );
}
