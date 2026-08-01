import type { Metadata } from "next";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import {
  deleteOrgNodeAction,
  upsertOrgNodeFormAction,
} from "@/lib/content/gallery-org-actions";
import { createClient } from "@/lib/supabase/server";
import { OrgTree } from "@/components/admin/org-tree";

export const metadata: Metadata = { title: "Admin · Family" };

export default async function AdminFamilyPage() {
  const supabase = await createClient();
  const { data: rawNodes, error } = await supabase
    .from("org_nodes")
    .select(
      "id, parent_id, full_name, role_title, avatar_url, sort_order, is_active, profile_id, profiles ( avatar_url )",
    )
    .order("sort_order", { ascending: true });

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

  const { count } = await supabase
    .from("membership_applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("member_status", "active");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">
            Brass Foundation Family
          </h1>
          <p className="mt-2 text-muted-foreground">
            Organization tree for screenshots — profile images as nodes, names
            and roles in compact labels.
          </p>
        </div>
        <div className="glass-card rounded-xl px-5 py-3 text-center">
          <p className="text-xs text-muted-foreground">Active members</p>
          <p className="font-heading text-2xl font-semibold text-primary">
            {count ?? "—"}
          </p>
        </div>
      </div>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run <code>20260801050000_uploads_org_gallery.sql</code>. ({error.message})
        </p>
      ) : (
        <OrgTree nodes={nodes || []} />
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="glass-card space-y-4 rounded-2xl p-6">
          <h2 className="font-heading text-lg font-semibold">Add person</h2>
          <form action={upsertOrgNodeFormAction} className="space-y-3">
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
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white"
            >
              Add to family tree
            </button>
          </form>
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
                  src={node.avatar_url || "/brand/logo.png"}
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
              <form action={deleteOrgNodeAction}>
                <input type="hidden" name="id" value={node.id} />
                <button
                  type="submit"
                  className="text-xs font-semibold text-destructive"
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
