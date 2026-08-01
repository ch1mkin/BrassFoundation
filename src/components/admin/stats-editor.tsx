"use client";

import { useState } from "react";
import { STAT_ICONS } from "@/lib/cms/stat-icons";
import { MaterialIcon } from "@/components/ui/material-icon";

export type EditableStat = {
  label: string;
  value: number;
  suffix?: string;
  icon: string;
};

export function StatsEditor({
  name = "stats_json",
  initial,
}: {
  name?: string;
  initial: EditableStat[];
}) {
  const [stats, setStats] = useState<EditableStat[]>(
    initial.length
      ? initial
      : [
          { label: "Members", value: 10000, suffix: "+", icon: "groups" },
          { label: "Events Held", value: 150, suffix: "+", icon: "event" },
        ],
  );

  function update(index: number, patch: Partial<EditableStat>) {
    setStats((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  }

  function addStat() {
    setStats((prev) => [
      ...prev,
      { label: "New metric", value: 0, suffix: "+", icon: "star" },
    ]);
  }

  function removeStat(index: number) {
    setStats((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-medium">Homepage stats</h2>
        <button
          type="button"
          onClick={addStat}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
        >
          Add stat
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Choose an icon, heading, and number for each card shown on the homepage.
      </p>

      {stats.map((stat, index) => (
        <div key={index} className="rounded-2xl border border-border/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <MaterialIcon name={stat.icon} className="text-2xl text-primary" />
            <button
              type="button"
              onClick={() => removeStat(index)}
              className="text-xs font-semibold text-destructive"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Heading</span>
              <input
                value={stat.label}
                onChange={(e) => update(index, { label: e.target.value })}
                className="h-10 w-full rounded-xl border border-input bg-white px-3"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Value</span>
              <input
                type="number"
                value={stat.value}
                onChange={(e) =>
                  update(index, { value: Number(e.target.value || 0) })
                }
                className="h-10 w-full rounded-xl border border-input bg-white px-3"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Suffix</span>
              <input
                value={stat.suffix || ""}
                onChange={(e) => update(index, { suffix: e.target.value })}
                placeholder="+"
                className="h-10 w-full rounded-xl border border-input bg-white px-3"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-muted-foreground">Icon</span>
              <select
                value={stat.icon}
                onChange={(e) => update(index, { icon: e.target.value })}
                className="h-10 w-full rounded-xl border border-input bg-white px-3"
              >
                {STAT_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {STAT_ICONS.slice(0, 12).map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => update(index, { icon })}
                className={`rounded-lg border p-1.5 ${stat.icon === icon ? "border-primary bg-primary/10" : "border-border"}`}
                title={icon}
              >
                <MaterialIcon name={icon} className="text-[18px]" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <input type="hidden" name={name} value={JSON.stringify(stats)} readOnly />
    </div>
  );
}
