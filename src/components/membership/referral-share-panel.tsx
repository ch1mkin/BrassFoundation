"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ReferralSharePanel({
  membershipId,
  referralLink,
  inviterName,
}: {
  membershipId: string;
  referralLink: string;
  inviterName: string;
}) {
  const [copied, setCopied] = useState<"code" | "link" | "message" | null>(
    null,
  );
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [message, setMessage] = useState(() =>
    defaultShareMessage(inviterName, membershipId, referralLink),
  );

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const whatsappHref = useMemo(() => {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }, [message]);

  const mailtoHref = useMemo(() => {
    const subject = `Join ${SITE.name}`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  }, [message]);

  async function copy(text: string, kind: "code" | "link" | "message") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    }
  }

  async function nativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: `Join ${SITE.name}`,
        text: message,
        url: referralLink,
      });
    } catch {
      // User cancelled share sheet — ignore
    }
  }

  return (
    <section className="glass-card space-y-5 rounded-2xl p-6 sm:p-8">
      <div>
        <h2 className="font-heading text-xl font-semibold">
          Your referral code & link
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your code or link. New members who join through it are tracked
          under your membership ID.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-low p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Referral code
          </p>
          <p className="mt-2 font-mono text-lg font-semibold tracking-wide">
            {membershipId}
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-3 h-9 rounded-lg"
            onClick={() => void copy(membershipId, "code")}
          >
            {copied === "code" ? "Copied" : "Copy code"}
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-surface-low p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Referral link
          </p>
          <p className="mt-2 break-all text-sm text-muted-foreground">
            {referralLink}
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-3 h-9 rounded-lg"
            onClick={() => void copy(referralLink, "link")}
          >
            {copied === "link" ? "Copied" : "Copy link"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <label className="block text-sm font-medium text-foreground">
            Custom invite message
          </label>
          <button
            type="button"
            className="text-xs font-semibold text-primary hover:underline"
            onClick={() =>
              setMessage(
                defaultShareMessage(inviterName, membershipId, referralLink),
              )
            }
          >
            Reset to default
          </button>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-input bg-white px-3 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="h-11 rounded-xl"
            onClick={() => void copy(message, "message")}
          >
            {copied === "message" ? "Message copied" : "Copy message"}
          </Button>
          {canNativeShare ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => void nativeShare()}
            >
              Share…
            </Button>
          ) : null}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold transition hover:bg-surface-low",
            )}
          >
            WhatsApp
            <MaterialIcon name="open_in_new" className="text-[16px]" />
          </a>
          <a
            href={mailtoHref}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold transition hover:bg-surface-low",
            )}
          >
            Email
            <MaterialIcon name="mail" className="text-[16px]" />
          </a>
        </div>
      </div>
    </section>
  );
}

function defaultShareMessage(
  inviterName: string,
  membershipId: string,
  referralLink: string,
) {
  const name = inviterName.trim() || "A Brass Foundation member";
  return [
    `Become a Part of the BRASS Foundation.`,
    ``,
    `${name} invited you to join ${SITE.name}.`,
    ``,
    `Register with my referral code: ${membershipId}`,
    `Or open this link: ${referralLink}`,
  ].join("\n");
}
