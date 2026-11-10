import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  commitUploadToGitHub,
  GitHubConfigurationError,
} from "@/src/lib/github/contents";

export const runtime = "nodejs";

const maxBytes = 2 * 1024 * 1024;
const signatures = {
  jpeg: { mime: "image/jpeg", extension: "jpg" },
  png: { mime: "image/png", extension: "png" },
  webp: { mime: "image/webp", extension: "webp" },
} as const;

function detectImage(bytes: Uint8Array): keyof typeof signatures | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return "jpeg";
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (
    bytes.length >= 8 &&
    pngSignature.every((byte, index) => bytes[index] === byte)
  )
    return "png";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP"
  )
    return "webp";
  return null;
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Choose a JPEG, PNG, or WebP image to upload." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json(
      { error: "Choose an image file to upload." },
      { status: 400 },
    );
  if (file.size === 0 || file.size > maxBytes) {
    return NextResponse.json(
      { error: "Images must be smaller than 2 MB." },
      { status: 413 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectImage(bytes);
  if (!detected || file.type !== signatures[detected].mime) {
    return NextResponse.json(
      { error: "The file must be a valid JPEG, PNG, or WebP image." },
      { status: 415 },
    );
  }

  const publicPath = `/uploads/${randomUUID()}.${signatures[detected].extension}`;
  try {
    await commitUploadToGitHub(`public${publicPath}`, bytes);
    return NextResponse.json({ ok: true, path: publicPath });
  } catch (error) {
    if (error instanceof GitHubConfigurationError)
      return NextResponse.json({ error: error.message }, { status: 503 });
    console.error("Portfolio image upload failed", error);
    return NextResponse.json(
      {
        error:
          "The image could not be saved. Check the server configuration and try again.",
      },
      { status: 502 },
    );
  }
}
