"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { upsertResourceAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";
import { uploadPdfWithThumbnail } from "@/lib/storage/pdf-thumbnail";

export function ResourceCreateForm() {
  const [state, action, pending] = useSafeFormAction(
    upsertResourceAction,
    {} as ContentActionState,
  );
  const [fileUrl, setFileUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();

  function onPdf(file: File | null) {
    if (!file) return;
    setUploadError(null);
    startUpload(async () => {
      const result = await uploadPdfWithThumbnail(file, "library");
      if (!result.ok) {
        setUploadError(result.error);
        return;
      }
      setFileUrl(result.url);
      if (result.thumbnailUrl) setThumbUrl(result.thumbnailUrl);
    });
  }

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <FormLock pending={pending || uploading} className="space-y-4">
      <h2 className="font-heading text-lg font-semibold">Add resource</h2>
      <Input name="title" required placeholder="Title" className="h-10 rounded-xl" />
      <Input name="subtitle" placeholder="Subtitle" className="h-10 rounded-xl" />
      <textarea
        name="description"
        placeholder="Description"
        rows={3}
        className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
      />
      <Input
        name="resource_type"
        defaultValue="pdf"
        placeholder="Type (pdf/video/audio/link)"
        className="h-10 rounded-xl"
      />

      <div className="space-y-2">
        <span className="text-sm font-medium text-muted-foreground">
          PDF upload (first page becomes thumbnail)
        </span>
        <input
          type="file"
          accept="application/pdf"
          className="block w-full text-xs"
          onChange={(e) => onPdf(e.target.files?.[0] || null)}
        />
        {uploading ? (
          <p className="text-xs text-muted-foreground">
            Uploading PDF + generating thumbnail…
          </p>
        ) : null}
        {uploadError ? (
          <p className="text-xs text-destructive">{uploadError}</p>
        ) : null}
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl}
            alt="PDF thumbnail"
            className="mt-2 h-40 w-auto rounded-lg border border-border object-contain"
          />
        ) : null}
      </div>

      <input type="hidden" name="file_url" value={fileUrl} />
      <input type="hidden" name="thumbnail_url" value={thumbUrl} />

      <FileOrUrlField
        name="external_url"
        label="Or paste external URL"
        bucket="resources"
        accept="application/pdf,image/*"
        folder="library"
      />
      <Input
        name="file_size_label"
        placeholder="Size label e.g. 12MB"
        className="h-10 rounded-xl"
      />
      <Input name="icon" defaultValue="menu_book" className="h-10 rounded-xl" />
      <Input name="tone" defaultValue="primary" className="h-10 rounded-xl" />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked
          className="size-4"
        />
        Published
      </label>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <Button
        type="submit"
        disabled={pending || uploading}
        className="rounded-xl bg-primary"
      >
        {pending ? "Saving…" : "Create resource"}
      </Button>
      </FormLock>
    </form>
  );
}
