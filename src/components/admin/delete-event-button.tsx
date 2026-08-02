"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import { deleteEventAction } from "@/lib/content/actions";
import type { ContentActionState } from "@/lib/content/utils";

const initial: ContentActionState = {};

export function DeleteEventButton({ id }: { id: string }) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(deleteEventAction, initial);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={action} className="text-right">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-semibold text-destructive disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state.error ? (
        <p className="mt-1 text-[11px] text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
