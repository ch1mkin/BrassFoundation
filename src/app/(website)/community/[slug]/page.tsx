import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/website/page-shell";
import { MaterialIcon } from "@/components/ui/material-icon";
import { COMMUNITY_PAGE } from "@/lib/constants";
import { getCommunityBySlug } from "@/lib/content/queries";

type Props = { params: Promise<{ slug: string }> };

function getStaticInitiative(slug: string) {
  return COMMUNITY_PAGE.initiatives.find((i) => i.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const initiative = getStaticInitiative(slug);
  if (initiative) return { title: initiative.title };
  const project = await getCommunityBySlug(slug);
  return { title: project?.title || "Community Work" };
}

export async function generateStaticParams() {
  return COMMUNITY_PAGE.initiatives.map((i) => ({ slug: i.slug }));
}

export default async function CommunityDetailPage({ params }: Props) {
  const { slug } = await params;
  const initiative = getStaticInitiative(slug);

  if (initiative) {
    return (
      <PageShell
        eyebrow="Community Work"
        title={initiative.title}
        description={COMMUNITY_PAGE.headline}
      >
        <div className="space-y-6">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MaterialIcon name={initiative.icon} className="text-[28px]" />
          </div>
          <p
            className="text-base leading-relaxed text-muted-foreground sm:text-lg"
            data-i18n="content"
          >
            {initiative.body}
          </p>
          {"impact" in initiative && initiative.impact ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {initiative.impact.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-2 rounded-xl bg-primary/5 px-3 py-2 text-sm font-medium"
                >
                  <MaterialIcon
                    name="check_circle"
                    className="mt-0.5 text-[18px] text-primary"
                  />
                  <span className="notranslate" translate="no">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <Link href="/community" className="inline-block font-semibold text-primary">
            ← All community work
          </Link>
        </div>
      </PageShell>
    );
  }

  const project = await getCommunityBySlug(slug);
  if (!project) notFound();

  return (
    <PageShell
      eyebrow={project.badge || "Community"}
      title={project.title}
      description={project.summary || undefined}
    >
      {project.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.cover_image_url}
          alt=""
          className="mb-8 aspect-[16/9] w-full rounded-2xl object-cover"
        />
      ) : null}
      {project.body ? (
        <div className="whitespace-pre-wrap leading-relaxed">{project.body}</div>
      ) : (
        <p className="text-muted-foreground">
          Project details and impact stories will be published from the admin
          portal.
        </p>
      )}
      <Link
        href="/community"
        className="mt-8 inline-block font-semibold text-primary"
      >
        ← All community work
      </Link>
    </PageShell>
  );
}
