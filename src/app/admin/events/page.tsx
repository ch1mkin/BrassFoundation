import type { Metadata } from "next";
import { AdminContentForm } from "@/components/admin/content-form";
import {
  deleteEventAction,
  upsertEventAction,
} from "@/lib/content/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Events" };

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, slug, starts_at, location, is_published, registration_open")
    .order("starts_at", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Events</h1>
        <p className="mt-2 text-muted-foreground">
          Create and publish upcoming events for the public site.
        </p>
      </div>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run <code>20260801040000_website_content.sql</code> in Supabase. (
          {error.message})
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <AdminContentForm
          title="Add event"
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
            },
            { name: "tone", label: "Tone (primary/secondary)", defaultValue: "primary" },
            { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
            {
              name: "registration_open",
              label: "Registration open",
              type: "checkbox",
              defaultValue: true,
            },
          ]}
        />

        <div className="space-y-3">
          {(data || []).map((row) => (
            <div key={row.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(row.starts_at).toLocaleString("en-IN")}
                    {row.location ? ` · ${row.location}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-primary">
                    {row.is_published ? "Published" : "Draft"}
                    {row.registration_open ? " · Open" : " · Closed"}
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
          {!error && !data?.length ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
