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

/**
 * Mathematical stick / lollipop chart with axes, gridlines, and dual series.
 */
export function ReferralLeaderboardChart({
  items,
  title = "Referral leaderboard",
  description,
}: {
  items: LeaderboardBarItem[];
  title?: string;
  description?: string;
}) {
  const top = items.slice(0, 10);
  const maxValue = Math.max(
    1,
    ...top.map((i) => Math.max(i.registrations, i.mandates)),
  );
  // Nice y-axis ceiling (ceil to next step of 1/2/5 * 10^n)
  const yMax = niceCeil(maxValue);
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) =>
    Math.round((yMax / ticks) * i),
  );

  const width = 720;
  const height = 320;
  const pad = { top: 28, right: 24, bottom: 72, left: 44 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const groupW = plotW / Math.max(top.length, 1);

  return (
    <section className="glass-card space-y-5 rounded-2xl p-6">
      <div>
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {!top.length ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No referral data yet.
        </p>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="min-w-[540px] w-full"
            role="img"
            aria-label="Referral stick chart"
          >
            {/* Grid + Y axis */}
            {yTicks.map((tick) => {
              const y = pad.top + plotH - (tick / yMax) * plotH;
              return (
                <g key={`yt-${tick}`}>
                  <line
                    x1={pad.left}
                    x2={width - pad.right}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    className="text-border"
                    strokeWidth={1}
                    strokeDasharray={tick === 0 ? undefined : "3 4"}
                    opacity={tick === 0 ? 1 : 0.7}
                  />
                  <text
                    x={pad.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-muted-foreground"
                    fontSize={10}
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Y axis line */}
            <line
              x1={pad.left}
              x2={pad.left}
              y1={pad.top}
              y2={pad.top + plotH}
              stroke="currentColor"
              className="text-foreground/40"
              strokeWidth={1.25}
            />
            {/* X axis line */}
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={pad.top + plotH}
              y2={pad.top + plotH}
              stroke="currentColor"
              className="text-foreground/40"
              strokeWidth={1.25}
            />
            <text
              x={12}
              y={pad.top + plotH / 2}
              transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={10}
            >
              Count
            </text>

            {top.map((item, index) => {
              const cx = pad.left + groupW * index + groupW / 2;
              const regX = cx - 10;
              const manX = cx + 10;
              const regH = (item.registrations / yMax) * plotH;
              const manH = (item.mandates / yMax) * plotH;
              const regY = pad.top + plotH - regH;
              const manY = pad.top + plotH - manH;
              const shortLabel =
                item.label.length > 12
                  ? `${item.label.slice(0, 11)}…`
                  : item.label;

              return (
                <g key={item.id}>
                  {/* Registration stick */}
                  <line
                    x1={regX}
                    x2={regX}
                    y1={pad.top + plotH}
                    y2={regY}
                    stroke={item.highlight ? "#0d9488" : "#006875"}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  <circle
                    cx={regX}
                    cy={regY}
                    r={5.5}
                    fill={item.highlight ? "#0d9488" : "#006875"}
                  />
                  {item.registrations > 0 ? (
                    <text
                      x={regX}
                      y={regY - 8}
                      textAnchor="middle"
                      className="fill-foreground"
                      fontSize={9}
                      fontWeight={600}
                    >
                      {item.registrations}
                    </text>
                  ) : null}

                  {/* Mandate stick */}
                  <line
                    x1={manX}
                    x2={manX}
                    y1={pad.top + plotH}
                    y2={manY}
                    stroke={item.highlight ? "#f59e0b" : "#002B5B"}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  <circle
                    cx={manX}
                    cy={manY}
                    r={5.5}
                    fill={item.highlight ? "#f59e0b" : "#002B5B"}
                  />
                  {item.mandates > 0 ? (
                    <text
                      x={manX}
                      y={manY - 8}
                      textAnchor="middle"
                      className="fill-foreground"
                      fontSize={9}
                      fontWeight={600}
                    >
                      {item.mandates}
                    </text>
                  ) : null}

                  <text
                    x={cx}
                    y={pad.top + plotH + 16}
                    textAnchor="middle"
                    className={cn(
                      item.highlight
                        ? "fill-primary"
                        : "fill-muted-foreground",
                    )}
                    fontSize={10}
                    fontWeight={item.highlight ? 700 : 500}
                  >
                    #{index + 1}
                  </text>
                  <text
                    x={cx}
                    y={pad.top + plotH + 32}
                    textAnchor="middle"
                    className="fill-foreground"
                    fontSize={9}
                  >
                    {shortLabel}
                  </text>
                  <title>{`${item.label}: ${item.registrations} registrations, ${item.mandates} mandates`}</title>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="flex flex-wrap gap-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block size-2.5 rounded-full bg-[#006875]" />
          Registrations (stick)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block size-2.5 rounded-full bg-[#002B5B]" />
          Mandates (stick)
        </span>
      </div>
    </section>
  );
}

function niceCeil(n: number) {
  if (n <= 1) return 1;
  const exp = Math.floor(Math.log10(n));
  const base = 10 ** exp;
  const frac = n / base;
  const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return nice * base;
}
