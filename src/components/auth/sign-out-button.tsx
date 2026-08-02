"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Client sign-out — clears the browser session, then hard-navigates.
 * Avoids server-action redirect quirks that leave the UI stuck signed in.
 */
export function SignOutButton({
  className,
  children = "Sign out",
  pendingLabel = "Signing out…",
}: {
  className?: string;
  children?: React.ReactNode;
  pendingLabel?: string;
}) {
  const [pending, setPending] = useState(false);

  async function onSignOut() {
    if (pending) return;
    setPending(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      // Still leave the page even if the network call fails.
    } finally {
      window.location.assign("/login");
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void onSignOut()}
      className={cn(className)}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
