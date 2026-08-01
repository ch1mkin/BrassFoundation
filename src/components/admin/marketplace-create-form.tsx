"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { upsertMarketplaceAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";

export function MarketplaceCreateForm() {
  const [state, action, pending] = useActionState(
    upsertMarketplaceAction,
    {} as ContentActionState,
  );

  return (
    <form action={action} className="glass-card space-y-4 rounded-2xl p-6">
      <h2 className="font-heading text-lg font-semibold">Add marketplace item</h2>
      <Input name="title" required placeholder="Title" className="h-10 rounded-xl" />
      <Input name="author" placeholder="Author" className="h-10 rounded-xl" />
      <textarea
        name="summary"
        placeholder="Summary"
        rows={3}
        className="w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
      />
      <Input name="price_label" defaultValue="₹399" className="h-10 rounded-xl" />
      <FileOrUrlField
        name="cover_image_url"
        label="Cover image upload or URL"
        bucket="marketplace"
        accept="image/*"
        folder="covers"
      />
      <FileOrUrlField
        name="file_url"
        label="PDF upload or URL"
        bucket="marketplace"
        accept="application/pdf"
        folder="books"
      />
      <Input name="buy_url" placeholder="Buy / external URL" className="h-10 rounded-xl" />
      <Input name="file_size_label" placeholder="PDF size label" className="h-10 rounded-xl" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_published" defaultChecked className="size-4" />
        Published
      </label>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-success">{state.success}</p> : null}
      <Button type="submit" disabled={pending} className="rounded-xl bg-primary">
        {pending ? "Saving…" : "Create item"}
      </Button>
    </form>
  );
}
