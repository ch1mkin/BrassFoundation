"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import type { ResourceCategoryRow } from "@/lib/content/resource-categories";
import { upsertResourceAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";
import { uploadFileClient } from "@/lib/storage/client-upload";
import { uploadPdfWithThumbnail } from "@/lib/storage/pdf-thumbnail";
import { formatBytes } from "@/lib/utils";

const RESOURCE_TYPES = [
  { id: "pdf", label: "PDF" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "link", label: "Link" },
  { id: "other", label: "Other" },
] as const;

export function ResourceCreateForm({
  categories,
}: {
  categories: ResourceCategoryRow[];
}) {
  const [state, action, pending] = useSafeFormAction(
    upsertResourceAction,
    {} as ContentActionState,
  );
  const [category, setCategory] = useState(categories[0]?.slug || "");
  const [resourceType, setResourceType] = useState<string>("pdf");
  const [fileUrl, setFileUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");
  const [sizeLabel, setSizeLabel] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!category && categories[0]?.slug) {
      setCategory(categories[0].slug);
    }
  }, [categories, category]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.slug === category),
    [categories, category],
  );

  async function onPdf(file: File | null) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const result = await uploadPdfWithThumbnail(file, "library");
      if (!result.ok) {
        setUploadError(result.error);
        return;
      }
      setFileUrl(result.url);
      if (result.thumbnailUrl) setThumbUrl(result.thumbnailUrl);
      setResourceType("pdf");
      setSizeLabel(formatBytes(file.size));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "PDF upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onAudio(file: File | null) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const result = await uploadFileClient("resources", file, "library");
      if (!result.ok) {
        setUploadError(result.error);
        return;
      }
      setFileUrl(result.url);
      setResourceType("audio");
      setSizeLabel(formatBytes(file.size));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Audio upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      action={action}
      className="glass-card space-y-4 rounded-2xl p-6"
      onSubmit={(e) => {
        if (uploading) {
          e.preventDefault();
        }
      }}
    >
      <FormLock
        pending={pending}
        label="Saving…"
        className="space-y-4"
      >
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
              setCategory(next);
              if (next === "leadership-podcast") setResourceType("audio");
            }}
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
          >
            {categories.map((cat) => (
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
            disabled={uploading || pending}
            className="block w-full text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              e.target.value = "";
              void onPdf(file);
            }}
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            Audio upload (podcasts / MP3)
          </span>
          <input
            type="file"
            accept="audio/mpeg,audio/mp3,audio/*"
            disabled={uploading || pending}
            className="block w-full text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              e.target.value = "";
              void onAudio(file);
            }}
          />
        </div>

        {uploading ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ButtonSpinner />
            Uploading file… (this does not save the resource yet)
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
        {fileUrl && !uploading ? (
          <p className="truncate text-xs text-success">
            File ready — click Create resource to save
          </p>
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
          value={sizeLabel}
          onChange={(e) => setSizeLabel(e.target.value)}
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
          disabled={pending || uploading || !category}
          className="rounded-xl bg-primary"
        >
          {pending ? (
            <>
              <ButtonSpinner />
              Saving…
            </>
          ) : uploading ? (
            <>
              <ButtonSpinner />
              Wait for upload…
            </>
          ) : (
            "Create resource"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
