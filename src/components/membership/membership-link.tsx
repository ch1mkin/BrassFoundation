"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { HardNavLink } from "@/components/website/hard-nav-link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Become a Member CTA that navigates reliably.
 * Paid members → Become a Contributor → /member/payments.
 */
export function MembershipLink({
  className,
  children,
  onClick,
  style,
  href = "/membership",
  memberHref = "/member/payments",
  memberLabel = "Become a Contributor",
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  href?: string;
  memberHref?: string;
  memberLabel?: string;
}) {
  const [targetHref, setTargetHref] = useState(href);
  const [labelOverride, setLabelOverride] = useState<string | null>(null);

  useEffect(() => {
    setTargetHref(href);
  }, [href]);

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
          setTargetHref(memberHref);
          setLabelOverride(memberLabel);
        }
      } catch {
        // Keep default membership link
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memberHref, memberLabel]);

  return (
    <HardNavLink
      href={targetHref}
      className={cn(className)}
      style={style}
      onClick={onClick}
    >
      {labelOverride ?? children}
    </HardNavLink>
  );
}
