"use client";

import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  ICON_OPTIONS,
  upsertResourceCategoryAction,
} from "@/lib/content/resource-category-actions";
import type { ContentActionState } from "@/lib/content/utils";
import { useState } from "react";

const TONES = [
  { id: "primary", label: "Primary" },
  { id: "secondary", label: "Secondary" },
  { id: "tertiary", label: "Tertiary" },
  { id: "brand", label: "Brand" },
] as const;

export function ResourceCategoryCreateForm() {
  const [state, action, pending] = useSafeFormAction(
    upsertResourceCategoryAction,
    {} as ContentActionState,
  );
  const [icon, setIcon] = useState<string>(ICON_OPTIONS[0]);

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <FormLock pending={pending} className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">Add category</h2>
        <p className="text-xs text-muted-foreground">
          Categories appear on the homepage Digital Library and
          /resources. Pick a Material icon name.
        </p>
        <Input
          name="title"
          required
          placeholder="Category title"
          className="h-10 rounded-xl"
        />
        <Input
          name="subtitle"
          placeholder="Short subtitle"
          className="h-10 rounded-xl"
        />
        <Input
          name="slug"
          placeholder="Slug (optional, auto from title)"
          className="h-10 rounded-xl"
        />

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Icon
          </span>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-primary">
              <MaterialIcon name={icon} className="text-[28px]" />
            </div>
            <select
              name="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="h-10 flex-1 rounded-xl border border-input bg-white px-3 text-sm"
            >
              {ICON_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Color tone
          </span>
          <select
            name="tone"
            defaultValue="primary"
            className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
          >
            {TONES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <Input
          name="sort_order"
          type="number"
          defaultValue={100}
          placeholder="Sort order"
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

        <Button type="submit" disabled={pending} className="rounded-xl bg-primary">
          {pending ? (
            <>
              <ButtonSpinner />
              Saving…
            </>
          ) : (
            "Create category"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
