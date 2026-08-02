"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { upsertCommunityAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";

export type CommunityAdminRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  badge: string | null;
  badge_tone: string | null;
  status: string | null;
  cover_image_url: string | null;
  sort_order: number | null;
  is_published: boolean | null;
  is_featured: boolean | null;
};

export function CommunityProjectForm({
  project,
}: {
  project?: CommunityAdminRow | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(
    upsertCommunityAction,
    {} as ContentActionState,
  );
  const editing = Boolean(project?.id);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <FormLock pending={pending} className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">
          {editing ? "Edit project" : "Add project"}
        </h2>
        <p className="text-xs text-muted-foreground">
          Published projects appear on the homepage Community section and
          /community. Upload a cover image for the homepage cards.
        </p>
        {editing ? <input type="hidden" name="id" value={project!.id} /> : null}
        <Input
          name="title"
          required
          defaultValue={project?.title || ""}
          placeholder="Title"
          className="h-10 rounded-xl"
        />
        <Input
          name="slug"
          defaultValue={project?.slug || ""}
          placeholder="Slug (optional)"
          className="h-10 rounded-xl"
        />
        <textarea
          name="summary"
          defaultValue={project?.summary || ""}
          placeholder="Summary (shown on homepage)"
          rows={3}
          className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
        />
        <textarea
          name="body"
          defaultValue={project?.body || ""}
          placeholder="Details"
          rows={4}
          className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            name="badge"
            defaultValue={project?.badge || "ONGOING"}
            placeholder="Badge e.g. ONGOING"
            className="h-10 rounded-xl"
          />
          <Input
            name="badge_tone"
            defaultValue={project?.badge_tone || "primary"}
            placeholder="Badge tone: primary | secondary | tertiary"
            className="h-10 rounded-xl"
          />
        </div>
        <Input
          name="status"
          defaultValue={project?.status || "ongoing"}
          placeholder="Status"
          className="h-10 rounded-xl"
        />
        <Input
          name="sort_order"
          type="number"
          defaultValue={project?.sort_order ?? 0}
          placeholder="Sort order"
          className="h-10 rounded-xl"
        />
        <FileOrUrlField
          name="cover_image_url"
          label="Cover image (homepage card)"
          bucket="gallery"
          accept="image/*"
          folder="community"
          defaultUrl={project?.cover_image_url || undefined}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={project?.is_featured ?? true}
            className="size-4"
          />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={project?.is_published ?? true}
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
        <Button type="submit" disabled={pending} className="rounded-xl bg-primary">
          {pending ? (
            <>
              <ButtonSpinner />
              Saving…
            </>
          ) : editing ? (
            "Update project"
          ) : (
            "Create project"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
