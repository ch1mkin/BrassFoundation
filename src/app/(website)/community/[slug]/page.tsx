import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/website/page-shell";
import { getCommunityBySlug } from "@/lib/content/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getCommunityBySlug(slug);
  return { title: project?.title || "Community" };
}

export default async function CommunityDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getCommunityBySlug(slug);
  if (!project) notFound();

  return (
    <PageShell
      eyebrow={project.badge || "Community"}
      title={project.title}
      description={project.summary || undefined}
    >
      {project.body ? (
        <div className="whitespace-pre-wrap leading-relaxed">{project.body}</div>
      ) : (
        <p className="text-muted-foreground">
          Project details and impact stories will be published from the admin
          portal.
        </p>
      )}
    </PageShell>
  );
}
