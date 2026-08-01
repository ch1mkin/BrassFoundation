"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  uploadFileClient,
  type UploadBucket,
} from "@/lib/storage/client-upload";

export function FileOrUrlField({
  name,
  label,
  bucket,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  folder,
  defaultUrl,
}: {
  name: string;
  label: string;
  bucket: UploadBucket;
  accept?: string;
  folder?: string;
  defaultUrl?: string;
}) {
  const [url, setUrl] = useState(defaultUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    setPending(true);
    try {
      const result = await uploadFileClient(bucket, file, folder);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <Input
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste URL or upload a file"
        className="h-10 rounded-xl bg-white"
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept={accept}
          disabled={pending}
          className="max-w-full text-xs"
          onChange={(e) => {
            void onFile(e.target.files?.[0] || null);
            e.target.value = "";
          }}
        />
        {pending ? (
          <span className="text-xs text-muted-foreground">Uploading…</span>
        ) : null}
        {url ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => setUrl("")}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="mt-1 h-28 w-auto max-w-full rounded-xl border border-border object-cover"
        />
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
