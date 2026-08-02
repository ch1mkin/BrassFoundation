import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/website/page-shell";
import { InstantImg } from "@/components/website/instant-img";
import { createClient } from "@/lib/supabase/server";
import { MaterialIcon } from "@/components/ui/material-icon";

export const metadata: Metadata = { title: "Blog" };

export default async function BlogIndexPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image_url, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <PageShell
      eyebrow="Blog"
      title="Stories & Insights"
      description="Articles and reflections from Brass Foundation."
      wide
    >
      {!data?.length ? (
        <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
          No blog posts yet. Publish from Admin → Blogs.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="glass-card overflow-hidden rounded-2xl transition hover:-translate-y-0.5"
            >
              {post.cover_image_url ? (
                <InstantImg
                  src={post.cover_image_url}
                  alt=""
                  priority={i < 3}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-surface-high">
                  <MaterialIcon name="article" className="text-4xl text-primary/40" />
                </div>
              )}
              <div className="p-5">
                <h2 className="font-heading text-lg font-semibold">
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
