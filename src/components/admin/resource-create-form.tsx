"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { upsertResourceAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";

export function ResourceCreateForm() {
  const [state, action, pending] = useActionState(
    upsertResourceAction,
    {} as ContentActionState,
  );

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
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
      <FileOrUrlField
        name="file_url"
        label="PDF / file upload or URL"
        bucket="resources"
        accept="application/pdf,image/*,audio/*,video/*"
        folder="library"
      />
      <Input
        name="external_url"
        placeholder="External URL (optional)"
        className="h-10 rounded-xl"
      />
      <Input
        name="file_size_label"
        placeholder="Size label e.g. 12MB"
        className="h-10 rounded-xl"
      />
      <Input name="icon" defaultValue="menu_book" className="h-10 rounded-xl" />
      <Input name="tone" defaultValue="primary" className="h-10 rounded-xl" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked className="size-4" />
        Published
      </label>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <Button type="submit" disabled={pending} className="rounded-xl bg-primary">
        {pending ? "Saving…" : "Create resource"}
      </Button>
    </form>
  );
}
