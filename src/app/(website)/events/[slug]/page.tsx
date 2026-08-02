import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventRegisterForm } from "@/components/website/event-register-form";
import { PageShell } from "@/components/website/page-shell";
import { getUserContext } from "@/lib/auth/session";
import { formatEventDate, getEventBySlug } from "@/lib/content/queries";
import { MaterialIcon } from "@/components/ui/material-icon";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return { title: event?.title || "Event" };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const { month, day } = formatEventDate(event);
  const context = await getUserContext();
  const canRegister =
    event.registration_open && !event.id.startsWith("fallback-");

  return (
    <PageShell eyebrow="Event" title={event.title} wide>
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {event.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.cover_image_url}
                alt=""
                className="size-20 rounded-xl object-cover ring-1 ring-border"
              />
            ) : null}
            <div className="inline-flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-white">
              <span className="text-xs font-semibold">{month}</span>
              <span className="font-heading text-2xl font-bold">{day}</span>
            </div>
          </div>
          {event.summary ? (
            <p className="text-lg text-muted-foreground">{event.summary}</p>
          ) : null}
          {event.location ? (
            <p className="mt-4 flex items-center gap-2 text-muted-foreground">
              <MaterialIcon name={event.location_icon || "location_on"} />
              {event.location}
            </p>
          ) : null}
          {event.body ? (
            <div className="mt-8 whitespace-pre-wrap leading-relaxed text-foreground">
              {event.body}
            </div>
          ) : null}
        </div>

        {canRegister ? (
          <EventRegisterForm
            eventId={event.id}
            eventSlug={event.slug}
            isLoggedIn={Boolean(context)}
            defaultName={context?.profile?.full_name || undefined}
            defaultEmail={context?.email || undefined}
          />
        ) : (
          <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
            {event.id.startsWith("fallback-")
              ? "Run the website content SQL migration to enable live registrations."
              : "Registration is closed for this event."}
          </div>
        )}
      </div>
    </PageShell>
  );
}
