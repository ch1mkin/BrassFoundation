import type { Metadata } from "next";
import Link from "next/link";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import {
  CommunityProjectForm,
  type CommunityAdminRow,
} from "@/components/admin/community-project-form";
import { InitiativeThumbnailForm } from "@/components/admin/initiative-thumbnail-form";
import { deleteCommunityAction } from "@/lib/content/actions";
import { COMMUNITY_WORK } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { cdnMediaUrl } from "@/lib/media/cdn";

export const metadata: Metadata = { title: "Admin · Community" };

const HOME_SLUGS = COMMUNITY_WORK.map((c) => c.slug);

export default async function AdminCommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("community_projects")
    .select(
      "id, title, slug, summary, body, badge, badge_tone, status, cover_image_url, sort_order, is_published, is_featured",
    )
    .order("sort_order", { ascending: true });

  const rows = (data || []) as CommunityAdminRow[];
  const editing = rows.find((row) => row.id === edit) ?? null;

  const homepageCards = HOME_SLUGS.map((slug, i) => {
    const existing = rows.find((r) => r.slug === slug);
    const seed = COMMUNITY_WORK[i];
    if (existing) return existing;
    // Placeholder until migration is run — form still needs an id to update.
    return {
      id: "",
      title: seed.title,
      slug: seed.slug,
      summary: seed.description,
      body: null,
      badge: seed.badge,
      badge_tone: seed.badgeTone,
      status: "ongoing",
      cover_image_url: null,
      sort_order: i + 1,
      is_published: true,
      is_featured: true,
    } satisfies CommunityAdminRow;
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Community Work</h1>
        <p className="mt-2 text-muted-foreground">
          Upload thumbnails for the three homepage initiative cards, or manage
          all community projects below.
        </p>
      </div>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content migration. ({error.message})
        </p>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-xl font-semibold">
            Homepage initiative thumbnails
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Free Study Centres, Career Guidance &amp; Mentorship, and Women&apos;s
            Empowerment Wing — these appear on the homepage Community section.
            Run migration{" "}
            <code className="text-xs">20260802090000_homepage_community_initiatives.sql</code>{" "}
            if these cards are missing.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {homepageCards.map((card) => (
            <InitiativeThumbnailForm key={card.slug} project={card} />
          ))}
        </div>
      </section>

      <section className="space-y-4 border-t border-border/60 pt-8">
        <h2 className="font-heading text-xl font-semibold">All projects</h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <CommunityProjectForm
            key={editing?.id || "new"}
            project={editing}
          />
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="glass-card rounded-2xl p-4">
                <div className="flex gap-3">
                  {row.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cdnMediaUrl(row.cover_image_url)}
                      alt=""
                      className="size-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs text-primary">
                      No img
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-medium">{row.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.status}
                          {row.badge ? ` · ${row.badge}` : ""}
                          {HOME_SLUGS.includes(
                            row.slug as (typeof HOME_SLUGS)[number],
                          )
                            ? " · Homepage card"
                            : ""}
                          {row.is_published ? "" : " · Draft"}
                        </p>
                      </div>
                      <AdminDeleteButton
                        id={row.id}
                        action={deleteCommunityAction}
                      />
                    </div>
                    <Link
                      href={`/admin/community?edit=${row.id}`}
                      className="mt-2 inline-block text-xs font-semibold text-primary hover:underline"
                    >
                      Edit / change image
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {editing ? (
              <Link
                href="/admin/community"
                className="inline-block text-sm font-semibold text-primary hover:underline"
              >
                ← Cancel edit / add new
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
