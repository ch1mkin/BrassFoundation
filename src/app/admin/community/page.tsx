import type { Metadata } from "next";
import { AdminContentForm } from "@/components/admin/content-form";
import {
  deleteCommunityAction,
  upsertCommunityAction,
} from "@/lib/content/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Community" };

export default async function AdminCommunityPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_projects")
    .select("id, title, badge, status, is_published")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Community Work</h1>
        <p className="mt-2 text-muted-foreground">
          Projects and impact stories for the public community section.
        </p>
      </div>
      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content migration. ({error.message})
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <AdminContentForm
          title="Add project"
          action={upsertCommunityAction}
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "slug", label: "Slug (optional)" },
            { name: "summary", label: "Summary", type: "textarea" },
            { name: "body", label: "Details", type: "textarea" },
            { name: "badge", label: "Badge", placeholder: "ONGOING" },
            { name: "badge_tone", label: "Badge tone", defaultValue: "primary" },
            { name: "status", label: "Status", defaultValue: "ongoing" },
            { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
          ]}
        />
        <div className="space-y-3">
          {(data || []).map((row) => (
            <div key={row.id} className="glass-card rounded-2xl p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.status}
                    {row.badge ? ` · ${row.badge}` : ""}
                  </p>
                </div>
                <form action={deleteCommunityAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button type="submit" className="text-xs font-semibold text-destructive">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
