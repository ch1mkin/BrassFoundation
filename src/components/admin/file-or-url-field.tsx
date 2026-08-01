"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadAdminFile, type UploadBucket } from "@/lib/storage/upload";

export function FileOrUrlField({
  name,
  label,
  bucket,
  accept,
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
  const [pending, startTransition] = useTransition();

  function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const result = await uploadAdminFile(bucket, file, folder);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUrl(result.url);
    });
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
          className="max-w-full text-xs"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
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
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
