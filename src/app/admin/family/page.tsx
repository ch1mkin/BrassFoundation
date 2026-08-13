import type { Metadata } from "next";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminLockedForm } from "@/components/admin/admin-locked-form";
import { FamilyTreeViewport } from "@/components/admin/family-tree-viewport";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { MembershipStatCards } from "@/components/admin/membership-stat-cards";
import {
  deleteOrgNodeAction,
  upsertOrgNodeFormAction,
} from "@/lib/content/gallery-org-actions";
import { loadFamilyTreePeople } from "@/lib/content/family-tree-data";
import { getMembershipStats } from "@/lib/membership/member-count";
import { createClient } from "@/lib/supabase/server";
import { cdnMediaUrl } from "@/lib/media/cdn";

export const metadata: Metadata = { title: "Admin · Family" };

export default async function AdminFamilyPage() {
  const supabase = await createClient();
  const [stats, treePeople, orgResult] = await Promise.all([
    getMembershipStats(),
    loadFamilyTreePeople().catch(() => []),
    supabase
      .from("org_nodes")
      .select(
        "id, parent_id, full_name, role_title, avatar_url, sort_order, is_active, profile_id, profiles ( avatar_url )",
      )
      .order("sort_order", { ascending: true }),
  ]);

  const { data: rawNodes, error } = orgResult;

  const nodes = (rawNodes || []).map((node) => {
    const linked = node.profiles as
      | { avatar_url: string | null }
      | { avatar_url: string | null }[]
      | null;
    const profileAvatar = Array.isArray(linked)
      ? linked[0]?.avatar_url
      : linked?.avatar_url;
    return {
      id: node.id,
      parent_id: node.parent_id,
      full_name: node.full_name,
      role_title: node.role_title,
      avatar_url: profileAvatar || node.avatar_url,
      sort_order: node.sort_order,
      is_active: node.is_active,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">
          BRASS Foundation Family
        </h1>
        <p className="mt-2 text-muted-foreground">
          Referrals appear as branches under the member who referred them.
          Family households are shown as a count badge on each profile. Drag to
          pan, scroll or use + / − to zoom.
        </p>
      </div>

      <MembershipStatCards {...stats} />

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run <code>20260801050000_uploads_org_gallery.sql</code>. (
          {error.message})
        </p>
      ) : null}

      <FamilyTreeViewport people={treePeople} />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="glass-card space-y-4 rounded-2xl p-6">
          <h2 className="font-heading text-lg font-semibold">Add person</h2>
          <AdminLockedForm
            action={upsertOrgNodeFormAction}
            submitLabel="Add to family tree"
            className="space-y-3"
          >
            <input
              name="full_name"
              required
              placeholder="Full name"
              className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
            />
            <input
              name="role_title"
              required
              placeholder="Role title"
              className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
            />
            <select
              name="parent_id"
              className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
              defaultValue=""
            >
              <option value="">No parent (root / top)</option>
              {(nodes || []).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.full_name} — {n.role_title}
                </option>
              ))}
            </select>
            <FileOrUrlField
              name="avatar_url"
              label="Profile image"
              bucket="avatars"
              accept="image/*"
              folder="org"
            />
          </AdminLockedForm>
        </div>

        <div className="space-y-2">
          {(nodes || []).map((node) => (
            <div
              key={node.id}
              className="glass-card flex items-center justify-between gap-3 rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cdnMediaUrl(node.avatar_url) || "/brand/logo.png"}
                  alt=""
                  className="size-10 rounded-full object-cover bg-white"
                />
                <div>
                  <p className="text-sm font-medium">{node.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {node.role_title}
                  </p>
                </div>
              </div>
              <AdminDeleteButton
                id={node.id}
                action={deleteOrgNodeAction}
                label="Remove"
                pendingLabel="Removing…"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
