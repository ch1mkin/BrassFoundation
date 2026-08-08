"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { upsertResourceCategoryAction } from "@/lib/content/resource-category-actions";
import type { ContentActionState } from "@/lib/content/utils";
import type { ResourceCategoryRow } from "@/lib/content/resource-categories";

/** Thumbnail upload for a Digital Library category card. */
export function ResourceCategoryThumbnailForm({
  category,
}: {
  category: ResourceCategoryRow;
}) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(
    upsertResourceCategoryAction,
    {} as ContentActionState,
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-5">
      <FormLock pending={pending} label="Saving thumbnail…" className="space-y-4">
        <div className="flex gap-3">
          {category.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.thumbnail_url}
              alt=""
              className="size-20 shrink-0 rounded-xl object-cover ring-1 ring-border"
            />
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MaterialIcon name={category.icon} className="text-3xl" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-heading text-base font-semibold">
              {category.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Card thumbnail · slug{" "}
              <span className="font-mono">{category.slug}</span>
            </p>
          </div>
        </div>

        <input type="hidden" name="title" value={category.title} />
        <input type="hidden" name="slug" value={category.slug} />
        <input type="hidden" name="subtitle" value={category.subtitle || ""} />
        <input type="hidden" name="icon" value={category.icon || "menu_book"} />
        <input type="hidden" name="tone" value={category.tone || "primary"} />
        <input
          type="hidden"
          name="sort_order"
          value={String(category.sort_order ?? 100)}
        />
        <input type="hidden" name="is_published" value="on" />

        <FileOrUrlField
          name="thumbnail_url"
          label="Upload or paste card thumbnail"
          bucket="gallery"
          accept="image/*"
          folder="resources/categories"
          defaultUrl={category.thumbnail_url || undefined}
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
