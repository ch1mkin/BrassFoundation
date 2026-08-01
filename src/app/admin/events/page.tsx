import type { Metadata } from "next";
import { AdminContentForm } from "@/components/admin/content-form";
import { EventCalendar } from "@/components/admin/event-calendar";
import {
  deleteEventAction,
  upsertEventAction,
} from "@/lib/content/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Events" };

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, slug, starts_at, location, is_published, registration_open",
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

  const defaultStarts = date
    ? date.slice(0, 16)
    : "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Events</h1>
        <p className="mt-2 text-muted-foreground">
          Calendar view, create by clicking a date, and track registrations.
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
        <AdminContentForm
          title={date ? `New event on ${date.slice(0, 10)}` : "Add event"}
          action={upsertEventAction}
          submitLabel="Create event"
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "slug", label: "Slug (optional)" },
            { name: "summary", label: "Summary", type: "textarea" },
            { name: "body", label: "Details", type: "textarea" },
            { name: "location", label: "Location" },
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
              defaultValue: "primary",
            },
            {
              name: "is_published",
              label: "Published",
              type: "checkbox",
              defaultValue: true,
            },
            {
              name: "registration_open",
              label: "Registration open",
              type: "checkbox",
              defaultValue: true,
            },
          ]}
        />

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">All events</h2>
          {(data || []).map((row) => (
            <div key={row.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(row.starts_at).toLocaleString("en-IN")}
                    {row.location ? ` · ${row.location}` : ""}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {counts.get(row.id) || 0} registrations
                  </p>
                </div>
                <form action={deleteEventAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-destructive"
                  >
                    Delete
                  </button>
                </form>
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
