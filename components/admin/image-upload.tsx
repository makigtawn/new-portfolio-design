"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ImageUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [path, setPath] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(file: File | undefined) {
    setPath("");
    setMessage("");
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    setBusy(true);
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const result = (await response.json()) as {
        path?: string;
        error?: string;
      };
      if (!response.ok || !result.path) {
        setMessage(result.error ?? "The image could not be uploaded.");
        return;
      }
      setPath(result.path);
      setMessage(
        "Uploaded. Copy the path into the image src field in your content section.",
      );
    } catch {
      setMessage("The image could not be uploaded. Try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section
      aria-labelledby="upload-heading"
      className="border-line mt-10 border-t pt-6"
    >
      <h2 id="upload-heading" className="text-sm font-medium">
        Upload an image
      </h2>
      <p className="text-muted mt-2 max-w-xl text-sm">
        JPEG, PNG, or WebP · up to 2 MB. The upload is committed to GitHub and
        will be available at the returned path.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Choose a JPEG, PNG, or WebP image"
          onChange={(event) => void upload(event.currentTarget.files?.[0])}
          className="file:border-line file:bg-paper file:text-ink max-w-full text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-2 file:text-sm"
        />
        {busy ? (
          <span role="status" className="text-muted text-sm">
            Uploading…
          </span>
        ) : null}
      </div>
      {message ? (
        <p role="status" className="text-muted mt-3 text-sm">
          {message}
        </p>
      ) : null}
      {path ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <code className="border-line rounded border px-2 py-1 text-sm">
            {path}
          </code>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void navigator.clipboard?.writeText(path)}
          >
            Copy path
          </Button>
        </div>
      ) : null}
    </section>
  );
}
