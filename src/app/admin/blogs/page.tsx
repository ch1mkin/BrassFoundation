import type { Metadata } from "next";
import { BlogEditorForm } from "@/components/admin/blog-editor-form";
import { deleteBlogAction } from "@/lib/content/blog-actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Blogs" };

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, body_html, cover_image_url, is_published, published_at")
    .order("updated_at", { ascending: false });

  const editing = data?.find((b) => b.id === edit) || null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Blogs</h1>
        <p className="mt-2 text-muted-foreground">
          Write and publish blogs with the rich text editor.
        </p>
      </div>
      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run <code>20260801060000_blogs_stats_thumbnails.sql</code>. (
          {error.message})
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <BlogEditorForm
          key={editing?.id || "new"}
          initial={editing || undefined}
        />
        <div className="space-y-3">
          {(data || []).map((post) => (
            <div key={post.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.is_published ? "Published" : "Draft"} · /blog/
                    {post.slug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/blogs?edit=${post.id}`}
                    className="text-xs font-semibold text-primary"
                  >
                    Edit
                  </a>
                  <form action={deleteBlogAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-destructive"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
