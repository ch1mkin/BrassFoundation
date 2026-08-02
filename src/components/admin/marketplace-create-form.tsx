"use client";

import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { upsertMarketplaceAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";

export function MarketplaceCreateForm() {
  const [state, action, pending] = useSafeFormAction(
    upsertMarketplaceAction,
    {} as ContentActionState,
  );

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <FormLock pending={pending} className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">
          Add featured book
        </h2>
        <p className="text-xs text-muted-foreground">
          Paid books unlock web-only reading after owner confirms payment.
          Upload the PDF here — it is never offered as a public download.
        </p>
        <Input
          name="title"
          required
          placeholder="Title"
          className="h-10 rounded-xl"
        />
        <Input name="author" placeholder="Author" className="h-10 rounded-xl" />
        <textarea
          name="summary"
          placeholder="Summary"
          rows={3}
          className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
        />
        <Input
          name="price_label"
          required
          defaultValue="₹399"
          placeholder="Price label e.g. ₹399"
          className="h-10 rounded-xl"
        />
        <Input
          name="price_rupees"
          required
          type="number"
          min={1}
          step="1"
          placeholder="Price in ₹ (used for Razorpay)"
          className="h-10 rounded-xl"
        />
        <FileOrUrlField
          name="cover_image_url"
          label="Cover image upload or URL"
          bucket="marketplace"
          accept="image/*"
          folder="covers"
        />
        <FileOrUrlField
          name="file_url"
          label="PDF upload (required for reading)"
          bucket="marketplace"
          accept="application/pdf"
          folder="books"
        />
        <Input
          name="file_size_label"
          placeholder="PDF size label"
          className="h-10 rounded-xl"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked
            className="size-4"
          />
          Featured on homepage
        </label>
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
            "Create book"
          )}
        </Button>
      </FormLock>
    </form>
  );
}
