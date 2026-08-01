import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/website/page-shell";
import {
  formatEventDate,
  getPublishedEvents,
} from "@/lib/content/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const events = await getPublishedEvents();

  return (
    <PageShell
      eyebrow="Events"
      title="Upcoming Events"
      description="Lectures, seminars, and community gatherings. Register online and join us."
      wide
    >
      <div className="space-y-4">
        {events.map((event) => {
          const { month, day } = formatEventDate(event);
          return (
            <div
              key={event.id}
              className="glass-card flex flex-col items-center gap-6 rounded-2xl p-5 md:flex-row md:gap-10"
            >
              <div
                className={cn(
                  "flex size-24 shrink-0 flex-col items-center justify-center rounded-xl text-white",
                  event.tone === "secondary" ? "bg-secondary" : "bg-primary",
                )}
              >
                <span className="text-xs font-semibold">{month}</span>
                <span className="font-heading text-3xl font-bold">{day}</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="font-heading text-xl font-semibold">
                  {event.title}
                </h2>
                {event.summary ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.summary}
                  </p>
                ) : null}
                {event.location ? (
                  <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground md:justify-start">
                    <span className="material-symbols-outlined text-[18px]">
                      {event.location_icon}
                    </span>
                    {event.location}
                  </p>
                ) : null}
              </div>
              <Link
                href={`/events/${event.slug}`}
                className={cn(
                  "rounded-lg px-8 py-2 text-sm font-bold text-white transition-transform active:scale-95",
                  event.tone === "secondary" ? "bg-secondary" : "bg-primary",
                )}
              >
                {event.registration_open ? "Register" : "View"}
              </Link>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
