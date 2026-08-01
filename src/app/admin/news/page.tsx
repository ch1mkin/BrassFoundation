import type { Metadata } from "next";
import { AdminContentForm } from "@/components/admin/content-form";
import { deleteNewsAction, upsertNewsAction } from "@/lib/content/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · News" };

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news_posts")
    .select("id, title, category, is_published, is_pinned, published_at")
    .order("published_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">News</h1>
        <p className="mt-2 text-muted-foreground">
          Announcements and articles for the public news page.
        </p>
      </div>
      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content migration. ({error.message})
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <AdminContentForm
          title="Add post"
          action={upsertNewsAction}
          fields={[
            { name: "title", label: "Title", required: true },
            { name: "slug", label: "Slug (optional)" },
            { name: "excerpt", label: "Excerpt", type: "textarea" },
            { name: "body", label: "Body", type: "textarea" },
            {
              name: "category",
              label: "Category",
              defaultValue: "announcement",
            },
            { name: "is_published", label: "Published", type: "checkbox", defaultValue: true },
            { name: "is_pinned", label: "Pinned", type: "checkbox", defaultValue: false },
          ]}
        />
        <div className="space-y-3">
          {(data || []).map((row) => (
            <div key={row.id} className="glass-card rounded-2xl p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.category}
                    {row.is_pinned ? " · Pinned" : ""}
                  </p>
                </div>
                <form action={deleteNewsAction}>
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
