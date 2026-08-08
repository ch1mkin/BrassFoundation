"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { HardNavLink } from "@/components/website/hard-nav-link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Become a Member CTA that navigates reliably.
 * If the viewer is already a paid member → Become a Contributor → /member.
 */
export function MembershipLink({
  className,
  children,
  onClick,
  style,
  memberLabel = "Become a Contributor",
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  memberLabel?: string;
}) {
  const [href, setHref] = useState("/membership");
  const [labelOverride, setLabelOverride] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;

        const { data: app } = await supabase
          .from("membership_applications")
          .select("membership_id, payment_status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (
          !cancelled &&
          app &&
          (app.payment_status === "paid" || app.membership_id)
        ) {
          setHref("/member");
          setLabelOverride(memberLabel);
        }
      } catch {
        // Keep default membership link
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memberLabel]);

  return (
    <HardNavLink
      href={href}
      className={cn(className)}
      style={style}
      onClick={onClick}
    >
      {labelOverride ?? children}
    </HardNavLink>
  );
}
