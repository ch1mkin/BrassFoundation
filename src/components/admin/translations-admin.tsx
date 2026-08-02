"use client";

import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  upsertTranslationAction,
  type TranslationActionState,
} from "@/lib/i18n/actions";

const initial: TranslationActionState = {};

export function TranslationsAdmin({
  rows,
}: {
  rows: Array<{
    key: string;
    en: string;
    pa: string | null;
    hi?: string | null;
  }>;
}) {
  const [state, action, pending] = useSafeFormAction(
    upsertTranslationAction,
    initial,
  );

  return (
    <div className="space-y-8">
      <form action={action} className="glass-card space-y-3 rounded-2xl p-6">
        <FormLock pending={pending} className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">
            Add / update translation
          </h2>
          <p className="text-sm text-muted-foreground">
            Fill Punjabi and Hindi for instant chrome switch. Empty fields fall
            back to Google Translate for page body text.
          </p>
          <Input
            name="key"
            required
            placeholder="key e.g. nav.home"
            className="h-10 rounded-xl"
          />
          <Input
            name="en"
            required
            placeholder="English"
            className="h-10 rounded-xl"
          />
          <Input
            name="pa"
            placeholder="ਪੰਜਾਬੀ (optional)"
            className="h-10 rounded-xl"
            lang="pa"
          />
          <Input
            name="hi"
            placeholder="हिन्दी (optional)"
            className="h-10 rounded-xl"
            lang="hi"
          />
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-success">{state.success}</p>
          ) : null}
          <Button type="submit" disabled={pending} className="rounded-xl">
            {pending ? "Saving…" : "Save"}
          </Button>
        </FormLock>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-card shadow-soft">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-surface-low text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">English</th>
              <th className="px-4 py-3">Punjabi</th>
              <th className="px-4 py-3">Hindi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-border/60">
                <td className="px-4 py-3 font-mono text-xs">{row.key}</td>
                <td className="px-4 py-3">{row.en}</td>
                <td className="px-4 py-3" lang="pa">
                  {row.pa || (
                    <span className="text-muted-foreground">
                      (Google fallback)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3" lang="hi">
                  {row.hi || (
                    <span className="text-muted-foreground">
                      (Google fallback)
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
