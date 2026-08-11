"use client";

import { cn } from "@/lib/utils";

export type LeaderboardBarItem = {
  id: string;
  label: string;
  subtitle?: string;
  registrations: number;
  mandates: number;
  highlight?: boolean;
};

export function ReferralLeaderboardChart({
  items,
  title = "Referral leaderboard",
  description,
}: {
  items: LeaderboardBarItem[];
  title?: string;
  description?: string;
}) {
  const max = Math.max(
    1,
    ...items.map((i) => Math.max(i.registrations, i.mandates)),
  );

  return (
    <section className="glass-card space-y-5 rounded-2xl p-6">
      <div>
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {!items.length ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No referral data yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={item.id} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-sm font-semibold",
                      item.highlight ? "text-primary" : "text-foreground",
                    )}
                  >
                    #{index + 1} {item.label}
                  </p>
                  {item.subtitle ? (
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      {item.subtitle}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                  {item.registrations} regs · {item.mandates} mandates
                </p>
              </div>
              <div className="space-y-1.5">
                <Bar
                  label="Registrations"
                  value={item.registrations}
                  max={max}
                  className="bg-primary"
                />
                <Bar
                  label="Mandates"
                  value={item.mandates}
                  max={max}
                  className="bg-secondary"
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block size-2.5 rounded-sm bg-primary" />{" "}
          Registrations
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block size-2.5 rounded-sm bg-secondary" />{" "}
          Mandates
        </span>
      </div>
    </section>
  );
}

function Bar({
  label,
  value,
  max,
  className,
}: {
  label: string;
  value: number;
  max: number;
  className?: string;
}) {
  const pct = Math.max(2, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/60">
        <div
          className={cn("h-full rounded-full transition-all", className)}
          style={{ width: `${pct}%` }}
          title={`${label}: ${value}`}
        />
      </div>
      <span className="w-6 shrink-0 text-right text-[11px] font-semibold tabular-nums">
        {value}
      </span>
    </div>
  );
}
