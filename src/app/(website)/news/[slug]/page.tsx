import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/website/page-shell";
import { getNewsBySlug } from "@/lib/content/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  return { title: post?.title || "News" };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  return (
    <PageShell eyebrow={post.category} title={post.title}>
      <p className="text-sm text-muted-foreground">
        {new Date(post.published_at).toLocaleDateString("en-IN", {
          dateStyle: "long",
        })}
      </p>
      {post.excerpt ? (
        <p className="mt-6 text-lg text-muted-foreground">{post.excerpt}</p>
      ) : null}
      {post.body ? (
        <div className="mt-8 whitespace-pre-wrap leading-relaxed">{post.body}</div>
      ) : (
        <p className="mt-8 text-muted-foreground">
          Full article content will appear here once published from admin.
        </p>
      )}
    </PageShell>
  );
}
