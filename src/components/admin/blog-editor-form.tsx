"use client";

import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { upsertBlogAction } from "@/lib/content/blog-actions";
import type { ContentActionState } from "@/lib/content/utils";

export function BlogEditorForm({
  initial,
}: {
  initial?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body_html: string;
    cover_image_url: string | null;
    is_published: boolean;
  };
}) {
  const [state, action, pending] = useSafeFormAction(
    upsertBlogAction,
    {} as ContentActionState,
  );

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <FormLock pending={pending} className="space-y-4">
      <h2 className="font-heading text-lg font-semibold">
        {initial ? "Edit blog" : "Write a blog"}
      </h2>
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <Input
        name="title"
        required
        placeholder="Title"
        defaultValue={initial?.title}
        className="h-10 rounded-xl"
      />
      <Input
        name="slug"
        placeholder="Slug (optional)"
        defaultValue={initial?.slug}
        className="h-10 rounded-xl"
      />
      <Input
        name="excerpt"
        placeholder="Short excerpt"
        defaultValue={initial?.excerpt || ""}
        className="h-10 rounded-xl"
      />
      <FileOrUrlField
        name="cover_image_url"
        label="Cover image"
        bucket="gallery"
        accept="image/*"
        folder="blogs"
        defaultUrl={initial?.cover_image_url || undefined}
      />
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Content
        </p>
        <RichTextEditor
          name="body_html"
          defaultHtml={initial?.body_html || ""}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={initial?.is_published ?? true}
        />
        Published
      </label>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <Button type="submit" disabled={pending} className="rounded-xl bg-primary">
        {pending ? "Saving…" : initial ? "Update blog" : "Save blog"}
      </Button>
      </FormLock>
    </form>
  );
}
