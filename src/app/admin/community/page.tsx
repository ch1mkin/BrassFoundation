import type { Metadata } from "next";
import Link from "next/link";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import {
  CommunityProjectForm,
  type CommunityAdminRow,
} from "@/components/admin/community-project-form";
import { deleteCommunityAction } from "@/lib/content/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Community" };

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

  const editing =
    (data || []).find((row) => row.id === edit) ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Community Work</h1>
        <p className="mt-2 text-muted-foreground">
          Projects and impact stories for the homepage Community section. Add a
          cover image so cards show a photo instead of a gradient.
        </p>
      </div>
      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content migration. ({error.message})
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <CommunityProjectForm
          key={editing?.id || "new"}
          project={editing as CommunityAdminRow | null}
        />
        <div className="space-y-3">
          {(data || []).map((row) => (
            <div key={row.id} className="glass-card rounded-2xl p-4">
              <div className="flex gap-3">
                {row.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.cover_image_url}
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
                        {row.is_featured ? " · Featured" : ""}
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
    </div>
  );
}
