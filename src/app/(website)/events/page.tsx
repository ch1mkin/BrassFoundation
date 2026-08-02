import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { HardNavLink } from "@/components/website/hard-nav-link";
import {
  formatEventDate,
  getPublishedEvents,
} from "@/lib/content/queries";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/ui/material-icon";

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
        {!events.length ? (
          <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
            No upcoming events published yet. Check back soon.
          </div>
        ) : null}
        {events.map((event) => {
          const { month, day } = formatEventDate(event);
          const href = event.slug
            ? `/events/${encodeURIComponent(event.slug)}#register`
            : "/events";
          return (
            <div
              key={event.id}
              className="glass-card flex flex-col items-center gap-6 rounded-2xl p-5 md:flex-row md:gap-10"
            >
              <div className="flex shrink-0 items-center gap-3">
                {event.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.cover_image_url}
                    alt=""
                    className="size-20 rounded-xl object-cover ring-1 ring-border"
                  />
                ) : null}
                <div
                  className={cn(
                    "flex size-20 shrink-0 flex-col items-center justify-center rounded-xl text-white sm:size-24",
                    event.tone === "secondary" ? "bg-secondary" : "bg-primary",
                  )}
                >
                  <span className="text-xs font-semibold">{month}</span>
                  <span className="font-heading text-3xl font-bold">{day}</span>
                </div>
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
                    <MaterialIcon name={event.location_icon || "location_on"} className="text-[18px]" />
                    {event.location}
                  </p>
                ) : null}
              </div>
              <HardNavLink
                href={href}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-lg px-8 py-2.5 text-sm font-bold text-white transition-transform active:scale-95",
                  event.tone === "secondary" ? "bg-secondary" : "bg-primary",
                )}
              >
                {event.registration_open ? "Register" : "View"}
              </HardNavLink>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
