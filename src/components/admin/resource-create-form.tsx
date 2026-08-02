"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { RESOURCE_CATEGORIES } from "@/lib/constants";
import { upsertResourceAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";
import { uploadFileClient } from "@/lib/storage/client-upload";
import { uploadPdfWithThumbnail } from "@/lib/storage/pdf-thumbnail";

const RESOURCE_TYPES = [
  { id: "pdf", label: "PDF" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "link", label: "Link" },
  { id: "other", label: "Other" },
] as const;

export function ResourceCreateForm() {
  const [state, action, pending] = useSafeFormAction(
    upsertResourceAction,
    {} as ContentActionState,
  );
  const [category, setCategory] = useState(RESOURCE_CATEGORIES[0].slug);
  const [resourceType, setResourceType] = useState<string>("pdf");
  const [fileUrl, setFileUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();

  const selectedCategory = useMemo(
    () => RESOURCE_CATEGORIES.find((c) => c.slug === category),
    [category],
  );

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
      setResourceType("pdf");
    });
  }

  function onAudio(file: File | null) {
    if (!file) return;
    setUploadError(null);
    startUpload(async () => {
      const result = await uploadFileClient("resources", file, "library");
      if (!result.ok) {
        setUploadError(result.error);
        return;
      }
      setFileUrl(result.url);
      setResourceType("audio");
    });
  }

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <FormLock pending={pending || uploading} className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">Add resource</h2>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Category
          </span>
          <select
            name="category"
            required
            value={category}
            onChange={(e) => {
              const next = e.target.value;
              setCategory(next as typeof category);
              const cat = RESOURCE_CATEGORIES.find((c) => c.slug === next);
              if (cat?.slug === "leadership-podcast") {
                setResourceType("audio");
              }
            }}
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
          >
            {RESOURCE_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.title}
              </option>
            ))}
          </select>
        </label>

        <Input
          name="title"
          required
          placeholder="Title"
          className="h-10 rounded-xl"
        />
        <Input
          name="subtitle"
          placeholder="Subtitle"
          className="h-10 rounded-xl"
        />
        <textarea
          name="description"
          placeholder="Description"
          rows={3}
          className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
        />

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Type
          </span>
          <select
            name="resource_type"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

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
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            Audio upload (podcasts / MP3)
          </span>
          <input
            type="file"
            accept="audio/mpeg,audio/mp3,audio/*"
            className="block w-full text-xs"
            onChange={(e) => onAudio(e.target.files?.[0] || null)}
          />
        </div>

        {uploading ? (
          <p className="text-xs text-muted-foreground">Uploading file…</p>
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
        {fileUrl && !thumbUrl ? (
          <p className="truncate text-xs text-success">File ready: {fileUrl}</p>
        ) : null}

        <input type="hidden" name="file_url" value={fileUrl} />
        <input type="hidden" name="thumbnail_url" value={thumbUrl} />
        <input
          type="hidden"
          name="icon"
          value={selectedCategory?.icon || "menu_book"}
        />
        <input
          type="hidden"
          name="tone"
          value={selectedCategory?.tone || "primary"}
        />

        <FileOrUrlField
          name="external_url"
          label="Or paste external URL"
          bucket="resources"
          accept="application/pdf,audio/*,image/*"
          folder="library"
        />
        <Input
          name="file_size_label"
          placeholder="Size label e.g. 12MB"
          className="h-10 rounded-xl"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked
            className="size-4"
          />
          Published
        </label>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-success">{state.success}</p>
        ) : null}
        <Button
          type="submit"
          disabled={pending || uploading}
          className="rounded-xl bg-primary"
        >
          {pending || uploading ? (
            <>
              <ButtonSpinner />
              {uploading ? "Uploading…" : "Saving…"}
            </>
          ) : (
            "Create resource"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
