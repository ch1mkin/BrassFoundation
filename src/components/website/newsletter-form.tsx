"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { subscribeNewsletterAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";

const initial: ContentActionState = {};

export function NewsletterForm() {
  const [state, action, pending] = useActionState(
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
          placeholder="Email for updates"
          className="h-10 rounded-xl bg-white"
        />
        <Button
          type="submit"
          disabled={pending}
          className="h-10 shrink-0 rounded-xl bg-primary px-4"
        >
          {pending ? "…" : "Join"}
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
