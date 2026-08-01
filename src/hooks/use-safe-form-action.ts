"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ActionResult = {
  error?: string;
  success?: string;
  redirectTo?: string;
  [key: string]: unknown;
};

/**
 * Drop-in replacement for useActionState that always clears pending.
 * Next.js useActionState can stick on "Saving…" after revalidatePath / refresh.
 */
export function useSafeFormAction<S extends ActionResult>(
  action: (prev: S, formData: FormData) => Promise<S>,
  initial: S,
  options?: { timeoutMs?: number },
) {
  const [state, setState] = useState<S>(initial);
  const [pending, setPending] = useState(false);
  const mounted = useRef(true);
  const stateRef = useRef(state);
  stateRef.current = state;
  const timeoutMs = options?.timeoutMs ?? 45_000;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const formAction = useCallback(
    async (formData: FormData) => {
      setPending(true);
      try {
        const result = await Promise.race([
          action(stateRef.current, formData),
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(
                new Error(
                  "This is taking too long. Check your connection and try again.",
                ),
              );
            }, timeoutMs);
          }),
        ]);
        if (mounted.current) setState(result);
      } catch (err) {
        const next = {
          ...initial,
          error:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
        } as S;
        if (mounted.current) setState(next);
      } finally {
        if (mounted.current) setPending(false);
      }
    },
    [action, initial, timeoutMs],
  );

  return [state, formAction, pending] as const;
}
