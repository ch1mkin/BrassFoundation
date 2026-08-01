"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import type { ContentActionState } from "@/lib/content/utils";

type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "datetime-local" | "number" | "url" | "checkbox";
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean | null;
};

export function AdminContentForm({
  title,
  action,
  fields,
  submitLabel = "Save",
  hidden,
}: {
  title: string;
  action: (
    prev: ContentActionState,
    formData: FormData,
  ) => Promise<ContentActionState>;
  fields: Field[];
  submitLabel?: string;
  hidden?: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="glass-card space-y-4 rounded-2xl p-6"
    >
      <FormLock pending={pending} className="space-y-4">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {hidden
        ? Object.entries(hidden).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))
        : null}
      {fields.map((field) => {
        if (field.type === "checkbox") {
          return (
            <label key={field.name} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={field.name}
                defaultChecked={Boolean(field.defaultValue ?? true)}
                className="size-4 rounded border-border"
              />
              {field.label}
            </label>
          );
        }
        if (field.type === "textarea") {
          return (
            <label key={field.name} className="block space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">
                {field.label}
              </span>
              <textarea
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                defaultValue={String(field.defaultValue ?? "")}
                rows={4}
                className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
              />
            </label>
          );
        }
        return (
          <label key={field.name} className="block space-y-1.5">
            <span className="text-sm font-medium text-muted-foreground">
              {field.label}
            </span>
            <Input
              name={field.name}
              type={field.type || "text"}
              required={field.required}
              placeholder={field.placeholder}
              defaultValue={
                field.defaultValue == null ? "" : String(field.defaultValue)
              }
              className="h-10 rounded-xl bg-white"
            />
          </label>
        );
      })}
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-success">{state.success}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="rounded-xl bg-primary">
        {pending ? "Saving…" : submitLabel}
      </Button>
      </FormLock>
    </form>
  );
}
