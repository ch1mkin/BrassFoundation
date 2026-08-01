"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

async function fileToJpegDataUrl(
  file: File,
  maxEdge = 720,
  quality = 0.82,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

export function SelfieField({
  name = "avatar_data_url",
  required = true,
  className,
}: {
  name?: string;
  required?: boolean;
  className?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function onPick(file: File | null) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please choose a photo.");
      }
      if (file.size > 12 * 1024 * 1024) {
        throw new Error("Photo must be under 12MB.");
      }
      const dataUrl = await fileToJpegDataUrl(file);
      setPreview(dataUrl);
    } catch (err) {
      setPreview(null);
      setError(err instanceof Error ? err.message : "Could not use that photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <span className="ml-1 text-sm font-medium text-muted-foreground">
        Profile photo / selfie {required ? "*" : "(optional)"}
      </span>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-low">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Profile preview"
              className="size-full object-cover"
            />
          ) : (
            <span className="px-3 text-center text-xs text-muted-foreground">
              Your photo
            </span>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:max-w-xs">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            onChange={(e) => {
              void onPick(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              void onPick(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
          >
            {busy ? "Processing…" : "Take selfie"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={busy}
            onClick={() => galleryRef.current?.click()}
          >
            Upload from gallery
          </Button>
          {preview ? (
            <button
              type="button"
              className="text-xs font-medium text-destructive hover:underline"
              onClick={() => setPreview(null)}
            >
              Remove photo
            </button>
          ) : null}
          <p className="text-xs text-muted-foreground">
            This photo appears on your profile icon, member portal, and org tree.
          </p>
        </div>
      </div>
      <input
        type="hidden"
        name={name}
        value={preview || ""}
        required={required}
      />
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
