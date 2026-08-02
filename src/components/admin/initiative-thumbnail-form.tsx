"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { upsertCommunityAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";
import type { CommunityAdminRow } from "@/components/admin/community-project-form";

/** Quick thumbnail upload for a fixed homepage initiative card. */
export function InitiativeThumbnailForm({
  project,
}: {
  project: CommunityAdminRow;
}) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(
    upsertCommunityAction,
    {} as ContentActionState,
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-5">
      <FormLock pending={pending} label="Saving thumbnail…" className="space-y-4">
        <div className="flex gap-3">
          {project.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.cover_image_url}
              alt=""
              className="size-20 shrink-0 rounded-xl object-cover ring-1 ring-border"
            />
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs text-primary">
              No image
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-heading text-base font-semibold">
              {project.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Homepage card thumbnail · slug{" "}
              <span className="font-mono">{project.slug}</span>
            </p>
          </div>
        </div>

        {project.id ? (
          <input type="hidden" name="id" value={project.id} />
        ) : null}
        <input type="hidden" name="title" value={project.title} />
        <input type="hidden" name="slug" value={project.slug} />
        <input type="hidden" name="summary" value={project.summary || ""} />
        <input type="hidden" name="body" value={project.body || ""} />
        <input type="hidden" name="badge" value={project.badge || "ONGOING"} />
        <input
          type="hidden"
          name="badge_tone"
          value={project.badge_tone || "primary"}
        />
        <input type="hidden" name="status" value={project.status || "ongoing"} />
        <input
          type="hidden"
          name="sort_order"
          value={String(project.sort_order ?? 0)}
        />
        <input type="hidden" name="is_featured" value="on" />
        <input type="hidden" name="is_published" value="on" />

        <FileOrUrlField
          name="cover_image_url"
          label="Upload or paste thumbnail image"
          bucket="gallery"
          accept="image/*"
          folder="community"
          defaultUrl={project.cover_image_url || undefined}
        />

        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm font-medium text-success" role="status">
            {state.success}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary"
        >
          {pending ? (
            <>
              <ButtonSpinner />
              Saving…
            </>
          ) : (
            "Save thumbnail"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
