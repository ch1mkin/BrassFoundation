"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import type { ContentActionState } from "@/lib/content/utils";

type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "datetime-local"
    | "number"
    | "url"
    | "checkbox"
    | "file-or-url";
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean | null;
  bucket?: "gallery" | "resources" | "marketplace" | "avatars";
  folder?: string;
  accept?: string;
};

function AdminContentFormInner({
  title,
  action,
  fields,
  submitLabel = "Save",
  hidden,
  resetPathOnSuccess,
  formId,
  onSuccess,
  successHoldMs = 2200,
}: {
  title: string;
  action: (
    prev: ContentActionState,
    formData: FormData,
  ) => Promise<ContentActionState>;
  fields: Field[];
  submitLabel?: string;
  hidden?: Record<string, string>;
  resetPathOnSuccess?: string;
  formId?: string;
  onSuccess?: () => void;
  successHoldMs?: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useSafeFormAction(action, {});
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!state.success) return;
    setBanner(state.success);
    router.refresh();
    const t = window.setTimeout(() => {
      setBanner(null);
      onSuccess?.();
      if (resetPathOnSuccess) router.replace(resetPathOnSuccess);
    }, successHoldMs);
    return () => window.clearTimeout(t);
  }, [state.success, router, onSuccess, resetPathOnSuccess, successHoldMs]);

  return (
    <form
      id={formId}
      action={formAction}
      className="glass-card relative space-y-4 rounded-2xl p-6"
    >
      <FormLock pending={pending} className="space-y-4" label="Saving…">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {hidden
          ? Object.entries(hidden).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))
          : null}
        {fields.map((field) => {
          if (field.type === "checkbox") {
            return (
              <label
                key={field.name}
                className="flex items-center gap-2 text-sm"
              >
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
          if (field.type === "file-or-url") {
            return (
              <FileOrUrlField
                key={field.name}
                name={field.name}
                label={field.label}
                bucket={field.bucket || "gallery"}
                folder={field.folder || "uploads"}
                accept={field.accept || "image/*"}
                defaultUrl={
                  field.defaultValue == null
                    ? undefined
                    : String(field.defaultValue)
                }
              />
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
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
        {banner ? (
          <p
            className="rounded-xl bg-success/10 px-3 py-2 text-sm font-medium text-success"
            role="status"
          >
            {banner}
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
            submitLabel
          )}
        </Button>
      </FormLock>
    </form>
  );
}

export function AdminContentForm({
  formKey,
  ...props
}: {
  title: string;
  action: (
    prev: ContentActionState,
    formData: FormData,
  ) => Promise<ContentActionState>;
  fields: Field[];
  submitLabel?: string;
  hidden?: Record<string, string>;
  /** Remount the form (and clear fields/state) when this changes. */
  formKey?: string;
  resetPathOnSuccess?: string;
  formId?: string;
  onSuccess?: () => void;
  successHoldMs?: number;
}) {
  return (
    <AdminContentFormInner key={formKey || "content-form"} {...props} />
  );
}
