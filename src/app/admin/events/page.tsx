import type { Metadata } from "next";
import { EventsAdminPanel } from "@/components/admin/events-admin-panel";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Events" };

export default async function AdminEventsPage() {
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

  const counts: Record<string, number> = {};
  for (const row of registrations || []) {
    counts[row.event_id] = (counts[row.event_id] || 0) + 1;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Events</h1>
        <p className="mt-2 text-muted-foreground">
          Click a calendar date to create, or click Edit / an event name to
          update. Published events appear live on the homepage and /events.
        </p>
      </div>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content migration. ({error.message})
        </p>
      ) : null}

      <EventsAdminPanel events={data || []} registrationCounts={counts} />

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
