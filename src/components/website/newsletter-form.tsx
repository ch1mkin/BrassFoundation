"use client";

import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/i18n/locale-provider";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { subscribeNewsletterAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";

const initial: ContentActionState = {};

export function NewsletterForm() {
  const { t } = useLocale();
  const [state, action, pending] = useSafeFormAction(
    subscribeNewsletterAction,
    initial,
  );

  return (
    <form action={action} className="mt-4 space-y-2">
      <FormLock pending={pending} className="space-y-2">
      <div className="flex gap-2">
        <Input
          name="email"
          type="email"
          required
          placeholder={t("footer.newsletterPlaceholder")}
          className="h-10 rounded-xl bg-white"
        />
        <Button
          type="submit"
          disabled={pending}
          className="h-10 shrink-0 rounded-xl bg-primary px-4"
        >
          {pending ? "…" : t("footer.newsletterJoin")}
        </Button>
      </div>
      {state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-success">{state.success}</p>
      ) : null}
      </FormLock>
    </form>
  );
}
