import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/website/page-shell";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return { title: data?.title || "Blog" };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt, body_html, published_at, cover_image_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!data) notFound();

  return (
    <PageShell eyebrow="Blog" title={data.title}>
      {data.published_at ? (
        <p className="mb-6 text-sm text-muted-foreground">
          {new Date(data.published_at).toLocaleDateString("en-IN", {
            dateStyle: "long",
          })}
        </p>
      ) : null}
      {data.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.cover_image_url}
          alt=""
          className="mb-8 max-h-[420px] w-full rounded-2xl object-cover"
        />
      ) : null}
      {data.excerpt ? (
        <p className="mb-8 text-lg text-muted-foreground">{data.excerpt}</p>
      ) : null}
      <article
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: data.body_html }}
      />
    </PageShell>
  );
}
