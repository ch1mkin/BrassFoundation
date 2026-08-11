"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ageFromIsoDate,
  DOB_MONTHS,
  dobYearOptions,
  parseIsoDate,
  toIsoDate,
} from "@/lib/membership/dob";
import { cn } from "@/lib/utils";

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function padDisplay(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Date of birth — Day / Month / Year selects and a calendar picker, kept in sync.
 * Submits ISO `YYYY-MM-DD` via hidden input `name`.
 */
export function DobField({
  name = "date_of_birth",
  value,
  onChange,
  required = true,
  minAge = 0,
  maxAge = 119,
  className,
}: {
  name?: string;
  /** ISO `YYYY-MM-DD` or empty */
  value: string;
  onChange: (iso: string) => void;
  required?: boolean;
  minAge?: number;
  maxAge?: number;
  className?: string;
}) {
  const parsed = parseIsoDate(value);
  const [day, setDay] = useState(parsed ? String(parsed.day) : "");
  const [month, setMonth] = useState(parsed ? String(parsed.month) : "");
  const [year, setYear] = useState(parsed ? String(parsed.year) : "");

  useEffect(() => {
    const next = parseIsoDate(value);
    if (next) {
      setDay(String(next.day));
      setMonth(String(next.month));
      setYear(String(next.year));
    } else if (!value) {
      // Parent cleared — only clear locals if all empty externally.
    }
  }, [value]);

  const years = useMemo(() => dobYearOptions(maxAge), [maxAge]);
  const age = value ? ageFromIsoDate(value) : null;

  const maxIso = useMemo(() => {
    const t = new Date();
    if (minAge > 0) t.setFullYear(t.getFullYear() - minAge);
    return `${t.getFullYear()}-${padDisplay(t.getMonth() + 1)}-${padDisplay(t.getDate())}`;
  }, [minAge]);

  const minIso = useMemo(() => {
    const t = new Date();
    t.setFullYear(t.getFullYear() - maxAge);
    return `${t.getFullYear()}-01-01`;
  }, [maxAge]);

  function publish(d: string, m: string, y: string) {
    if (!d || !m || !y) {
      onChange("");
      return;
    }
    onChange(toIsoDate(Number(y), Number(m), Number(d)) || "");
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input type="hidden" name={name} value={value} required={required} />
      <div className="grid grid-cols-3 gap-2">
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Day</span>
          <select
            value={day}
            onChange={(e) => {
              const next = e.target.value;
              setDay(next);
              publish(next, month, year);
            }}
            className={selectClass}
            aria-label="Day of birth"
          >
            <option value="">DD</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={String(d)}>
                {padDisplay(d)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Month
          </span>
          <select
            value={month}
            onChange={(e) => {
              const next = e.target.value;
              setMonth(next);
              publish(day, next, year);
            }}
            className={selectClass}
            aria-label="Month of birth"
          >
            <option value="">MM</option>
            {DOB_MONTHS.map((m) => (
              <option key={m.value} value={String(m.value)}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Year
          </span>
          <select
            value={year}
            onChange={(e) => {
              const next = e.target.value;
              setYear(next);
              publish(day, month, next);
            }}
            className={selectClass}
            aria-label="Year of birth"
          >
            <option value="">YYYY</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-muted-foreground">
          Or pick from calendar
        </span>
        <input
          type="date"
          value={value}
          min={minIso}
          max={maxIso}
          onChange={(e) => {
            const iso = e.target.value;
            onChange(iso);
            const p = parseIsoDate(iso);
            if (p) {
              setDay(String(p.day));
              setMonth(String(p.month));
              setYear(String(p.year));
            } else {
              setDay("");
              setMonth("");
              setYear("");
            }
          }}
          className={selectClass}
          aria-label="Date of birth calendar"
        />
      </label>

      {age !== null && age >= 0 ? (
        <p className="text-xs text-muted-foreground">Age: {age} years</p>
      ) : null}
    </div>
  );
}
