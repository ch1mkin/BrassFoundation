"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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

  function onDayClick(date: Date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const value = `${yyyy}-${mm}-${dd}T10:00`;
    router.push(
      `${createHrefBase}?date=${encodeURIComponent(value)}#event-form`,
    );
  }

  function onEventClick(e: React.MouseEvent, eventId: string) {
    e.stopPropagation();
    router.push(`${createHrefBase}?edit=${eventId}#event-form`);
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
              <div key={cell.key} className="min-h-24 rounded-lg bg-transparent" />
            );
          }
          const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
          const dayEvents = byDay.get(key) || [];
          const isToday =
            new Date().toDateString() === cell.date.toDateString();

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onDayClick(cell.date!)}
              className={cn(
                "min-h-24 rounded-lg border border-border/40 p-1.5 text-left transition hover:border-primary hover:bg-primary/5",
                isToday && "border-primary/50 bg-primary/5",
              )}
            >
              <span className="text-xs font-semibold">
                {cell.date.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <span
                    key={ev.id}
                    role="link"
                    tabIndex={0}
                    onClick={(e) => onEventClick(e, ev.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onEventClick(e as unknown as React.MouseEvent, ev.id);
                      }
                    }}
                    className="block truncate rounded bg-primary/15 px-1 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/30"
                    title={`Edit: ${ev.title}`}
                  >
                    {ev.title}
                  </span>
                ))}
                {dayEvents.length > 3 ? (
                  <div className="text-[10px] text-muted-foreground">
                    +{dayEvents.length - 3} more
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Click a date to create an event. Click an event name to edit it.
      </p>
    </div>
  );
}
