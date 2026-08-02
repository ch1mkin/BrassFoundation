import type { Metadata } from "next";
import Link from "next/link";
import { AdminContentForm } from "@/components/admin/content-form";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { EventCalendar } from "@/components/admin/event-calendar";
import { upsertEventAction } from "@/lib/content/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Events" };

function normalizeDatetimeLocal(raw: string | undefined) {
  if (!raw) return "";
  const cleaned = decodeURIComponent(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(cleaned)) {
    return cleaned.slice(0, 16);
  }
  const parsed = new Date(cleaned);
  if (Number.isNaN(parsed.getTime())) return "";
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function toDatetimeLocal(iso: string) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; edit?: string }>;
}) {
  const { date, edit } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, slug, summary, body, location, starts_at, tone, is_published, registration_open, cover_image_url",
    )
    .order("starts_at", { ascending: true });

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("id, event_id, full_name, email, phone, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const counts = new Map<string, number>();
  for (const row of registrations || []) {
    counts.set(row.event_id, (counts.get(row.event_id) || 0) + 1);
  }

  const editing = edit ? data?.find((e) => e.id === edit) || null : null;
  const defaultStarts = editing
    ? toDatetimeLocal(editing.starts_at)
    : normalizeDatetimeLocal(date);
  const dateLabel = !editing && defaultStarts ? defaultStarts.slice(0, 10) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Events</h1>
        <p className="mt-2 text-muted-foreground">
          Click a calendar date to create, or click an event / Edit to update.
          Published events appear live on the homepage and /events.
        </p>
      </div>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content migration. ({error.message})
        </p>
      ) : null}

      <EventCalendar
        events={(data || []).map((e) => ({
          id: e.id,
          title: e.title,
          starts_at: e.starts_at,
          slug: e.slug,
        }))}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {editing ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Editing existing event
              </p>
              <Link
                href="/admin/events#event-form"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Cancel · New event
              </Link>
            </div>
          ) : null}
          <AdminContentForm
            formKey={editing?.id || defaultStarts || "new-event"}
            formId="event-form"
            resetPathOnSuccess="/admin/events"
            title={
              editing
                ? `Edit: ${editing.title}`
                : dateLabel
                  ? `New event on ${dateLabel}`
                  : "Add event"
            }
            action={upsertEventAction}
            submitLabel={editing ? "Save changes" : "Create event"}
            hidden={editing ? { id: editing.id } : undefined}
            fields={[
              {
                name: "title",
                label: "Title",
                required: true,
                defaultValue: editing?.title || "",
              },
              {
                name: "slug",
                label: "Slug (optional)",
                defaultValue: editing?.slug || "",
              },
              {
                name: "summary",
                label: "Summary",
                type: "textarea",
                defaultValue: editing?.summary || "",
              },
              {
                name: "body",
                label: "Details",
                type: "textarea",
                defaultValue: editing?.body || "",
              },
              {
                name: "location",
                label: "Location",
                defaultValue: editing?.location || "",
              },
              {
                name: "starts_at",
                label: "Starts at",
                type: "datetime-local",
                required: true,
                defaultValue: defaultStarts,
              },
              {
                name: "tone",
                label: "Tone (primary/secondary)",
                defaultValue: editing?.tone || "primary",
              },
              {
                name: "cover_image_url",
                label: "Cover image URL (optional)",
                defaultValue: editing?.cover_image_url || "",
              },
              {
                name: "is_published",
                label: "Published (show on website)",
                type: "checkbox",
                defaultValue: editing ? editing.is_published : true,
              },
              {
                name: "registration_open",
                label: "Registration open",
                type: "checkbox",
                defaultValue: editing ? editing.registration_open : true,
              },
            ]}
          />
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">All events</h2>
          {!(data || []).length ? (
            <p className="text-sm text-muted-foreground">
              No events yet. Click a calendar date to create one.
            </p>
          ) : null}
          {(data || []).map((row) => (
            <div
              key={row.id}
              className={`glass-card rounded-2xl p-4 ${
                editing?.id === row.id ? "ring-2 ring-primary/40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(row.starts_at).toLocaleString("en-IN")}
                    {row.location ? ` · ${row.location}` : ""}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {counts.get(row.id) || 0} registrations
                    {row.is_published ? " · Live" : " · Draft"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Link
                    href={`/admin/events?edit=${row.id}#event-form`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteEventButton id={row.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-heading mb-4 text-lg font-semibold">
          Recent registrations
        </h2>
        {!registrations?.length ? (
          <p className="text-sm text-muted-foreground">No registrations yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((row) => {
                  const event = data?.find((e) => e.id === row.event_id);
                  return (
                    <tr key={row.id} className="border-b border-border/50">
                      <td className="px-4 py-3 font-medium">{row.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {row.email}
                      </td>
                      <td className="px-4 py-3">{event?.title || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
