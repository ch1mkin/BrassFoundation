import { createServiceClient } from "@/lib/supabase/admin";

/**
 * Attach a newly approved member under the Brass Foundation root node.
 * Idempotent — skips if this profile is already on the tree.
 */
export async function attachMemberToOrgTree(input: {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  roleTitle?: string;
}) {
  const admin = createServiceClient();

  const { data: existing } = await admin
    .from("org_nodes")
    .select("id")
    .eq("profile_id", input.userId)
    .maybeSingle();

  if (existing) {
    if (input.avatarUrl) {
      await admin
        .from("org_nodes")
        .update({
          avatar_url: input.avatarUrl,
          full_name: input.fullName,
        })
        .eq("id", existing.id);
    }
    return;
  }

  let parentId: string | null = null;
  const { data: root } = await admin
    .from("org_nodes")
    .select("id")
    .is("parent_id", null)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (root) {
    parentId = root.id;
  } else {
    const { data: createdRoot } = await admin
      .from("org_nodes")
      .insert({
        full_name: "Brass Foundation",
        role_title: "Organization",
        sort_order: 0,
        is_active: true,
      })
      .select("id")
      .single();
    parentId = createdRoot?.id ?? null;
  }

  const { count } = await admin
    .from("org_nodes")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", parentId);

  await admin.from("org_nodes").insert({
    parent_id: parentId,
    profile_id: input.userId,
    full_name: input.fullName,
    role_title: input.roleTitle || "Member",
    avatar_url: input.avatarUrl || null,
    sort_order: (count ?? 0) + 1,
    is_active: true,
  });
}
