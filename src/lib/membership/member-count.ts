import { createServiceClient } from "@/lib/supabase/admin";

/** Staff / admin portal roles — never counted as public members. */
const ADMIN_ROLE_SLUGS = [
  "super_admin",
  "admin",
  "secretary",
  "treasurer",
] as const;

async function getAdminUserIds(): Promise<string[]> {
  const admin = createServiceClient();
  const { data: roles } = await admin
    .from("roles")
    .select("id")
    .in("slug", [...ADMIN_ROLE_SLUGS]);

  const roleIds = (roles ?? []).map((r) => r.id);
  if (!roleIds.length) return [];

  const { data: userRoles } = await admin
    .from("user_roles")
    .select("user_id")
    .in("role_id", roleIds);

  return [
    ...new Set(
      (userRoles ?? [])
        .map((r) => r.user_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
}

/**
 * Public website member count — service role so login/logout never changes it.
 * Only paid + approved applications with a membership ID.
 * Admin / staff accounts are excluded even if they have membership rows.
 */
export async function getLiveMemberCount(): Promise<number> {
  try {
    const admin = createServiceClient();
    const adminIds = await getAdminUserIds();

    const [{ data: primaryRows }, { data: familyRows }] = await Promise.all([
      admin
        .from("membership_applications")
        .select("id, user_id")
        .eq("payment_status", "paid")
        .eq("status", "approved")
        .not("membership_id", "is", null),
      admin
        .from("family_members")
        .select("id, parent_user_id")
        .in("payment_status", ["paid", "waived"])
        .not("membership_id", "is", null),
    ]);

    const adminSet = new Set(adminIds);
    const primary = (primaryRows ?? []).filter(
      (row) => !row.user_id || !adminSet.has(row.user_id),
    ).length;
    const family = (familyRows ?? []).filter(
      (row) => !row.parent_user_id || !adminSet.has(row.parent_user_id),
    ).length;

    return primary + family;
  } catch (err) {
    console.error("[member-count] Failed to load live count:", err);
    return 0;
  }
}
