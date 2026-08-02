"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CalEvent = {
  id: string;
  title: string;
  starts_at: string;
  slug?: string;
};

export function EventCalendar({
  events,
  createHrefBase = "/admin/events",
}: {
  events: CalEvent[];
  createHrefBase?: string;
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const days = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date | null; key: string }> = [];
    for (let i = 0; i < firstDow; i++) {
      cells.push({ date: null, key: `e-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), key: `d-${d}` });
    }
    return cells;
  }, [year, month]);

  const byDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const event of events) {
      const d = new Date(event.starts_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const list = map.get(key) || [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const label = cursor.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  function dayHref(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    // Use date-only param — more reliable than encoding T/colon in some browsers
    return `${createHrefBase}?date=${yyyy}-${mm}-${dd}#event-form`;
  }

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1 text-sm"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          Prev
        </button>
        <h2 className="font-heading text-lg font-semibold">{label}</h2>
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-1 text-sm"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((cell) => {
          if (!cell.date) {
            return (
              <div
                key={cell.key}
                className="min-h-24 rounded-lg bg-transparent"
              />
            );
          }
          const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
          const dayEvents = byDay.get(key) || [];
          const isToday =
            new Date().toDateString() === cell.date.toDateString();

          return (
            <div
              key={cell.key}
              className={cn(
                "relative min-h-24 rounded-lg border border-border/40 p-1.5 text-left transition hover:border-primary hover:bg-primary/5",
                isToday && "border-primary/50 bg-primary/5",
              )}
            >
              <Link
                href={dayHref(cell.date)}
                className="absolute inset-0 z-0 rounded-lg"
                aria-label={`Create event on ${cell.date.toDateString()}`}
              />
              <span className="relative z-10 text-xs font-semibold pointer-events-none">
                {cell.date.getDate()}
              </span>
              <div className="relative z-10 mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <Link
                    key={ev.id}
                    href={`${createHrefBase}?edit=${ev.id}#event-form`}
                    className="block truncate rounded bg-primary/15 px-1 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/30"
                    title={`Edit: ${ev.title}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ev.title}
                  </Link>
                ))}
                {dayEvents.length > 3 ? (
                  <div className="pointer-events-none text-[10px] text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Click a date to create an event. Click an event name to edit it.
      </p>
    </div>
  );
}
