import { createServiceClient } from "@/lib/supabase/admin";

/** Staff / admin portal roles — never counted as public members. */
const ADMIN_ROLE_SLUGS = [
  "super_admin",
  "admin",
  "secretary",
  "treasurer",
] as const;

async function getAdminUserIds(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
): Promise<string[]> {
  const { data: roles } = await admin
    .from("roles")
    .select("id")
    .in("slug", [...ADMIN_ROLE_SLUGS]);
  const roleIds = (roles || []).map((r: { id: string }) => r.id);
  if (!roleIds.length) return [];

  const { data: userRoles } = await admin
    .from("user_roles")
    .select("user_id")
    .in("role_id", roleIds);

  return [
    ...new Set(
      (userRoles || [])
        .map((r: { user_id: string | null }) => r.user_id)
        .filter(Boolean) as string[],
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
    const adminIds = await getAdminUserIds(admin);

    let primaryQuery = admin
      .from("membership_applications")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "paid")
      .eq("status", "approved")
      .not("membership_id", "is", null);

    let familyQuery = admin
      .from("family_members")
      .select("id", { count: "exact", head: true })
      .in("payment_status", ["paid", "waived"])
      .not("membership_id", "is", null);

    if (adminIds.length) {
      // PostgREST `not.in` filter — keep the count membership-only, no staff.
      const list = `(${adminIds.join(",")})`;
      primaryQuery = primaryQuery.not("user_id", "in", list);
      familyQuery = familyQuery.not("parent_user_id", "in", list);
    }

    const [{ count: primary }, { count: family }] = await Promise.all([
      primaryQuery,
      familyQuery,
    ]);

    return (primary || 0) + (family || 0);
  } catch (err) {
    console.error("[member-count] Failed to load live count:", err);
    return 0;
  }
}
