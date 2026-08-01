import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { UPCOMING_EVENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <PageShell
      eyebrow="Events"
      title="Upcoming Events"
      description="Lectures, seminars, and community gatherings. Registration, QR check-in, and certificates are coming next."
      wide
    >
      <div className="space-y-4">
        {UPCOMING_EVENTS.map((event) => (
          <div
            key={event.title}
            className="glass-card flex flex-col items-center gap-6 rounded-2xl p-5 md:flex-row md:gap-10"
          >
            <div
              className={cn(
                "flex size-24 shrink-0 flex-col items-center justify-center rounded-xl text-white",
                event.tone === "primary" ? "bg-primary" : "bg-secondary",
              )}
            >
              <span className="text-xs font-semibold">{event.month}</span>
              <span className="font-heading text-3xl font-bold">{event.day}</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-heading text-xl font-semibold">
                {event.title}
              </h2>
              <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground md:justify-start">
                <span className="material-symbols-outlined text-[18px]">
                  {event.locationIcon}
                </span>
                {event.location}
              </p>
            </div>
            <button
              type="button"
              className={cn(
                "rounded-lg px-8 py-2 text-sm font-bold text-white transition-transform active:scale-95",
                event.tone === "primary" ? "bg-primary" : "bg-secondary",
              )}
            >
              Register
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
