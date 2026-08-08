import { createServiceClient } from "@/lib/supabase/admin";

/** Staff / admin portal roles — never counted as public members. */
const ADMIN_ROLE_SLUGS = [
  "super_admin",
  "admin",
  "secretary",
  "treasurer",
] as const;

/** Issued IDs look like BF-2026-123456 */
function hasRealMembershipId(value: string | null | undefined): boolean {
  const id = String(value || "").trim();
  if (!id) return false;
  return /^BF-\d{4}-\d+$/i.test(id);
}

async function getAdminUserIds(): Promise<Set<string>> {
  const admin = createServiceClient();
  const { data: roles } = await admin
    .from("roles")
    .select("id")
    .in("slug", [...ADMIN_ROLE_SLUGS]);

  const roleIds = (roles ?? []).map((r) => r.id);
  if (!roleIds.length) return new Set();

  const { data: userRoles } = await admin
    .from("user_roles")
    .select("user_id")
    .in("role_id", roleIds);

  return new Set(
    (userRoles ?? [])
      .map((r) => r.user_id)
      .filter((id): id is string => Boolean(id)),
  );
}

/**
 * Exact public member total for the homepage.
 * Counts only primary applications that have a real membership ID
 * (paid + approved). Admins/staff never count. Family members are excluded.
 */
export async function getLiveMemberCount(): Promise<number> {
  try {
    const admin = createServiceClient();
    const adminIds = await getAdminUserIds();

    const { data, error } = await admin
      .from("membership_applications")
      .select("id, user_id, membership_id, payment_status, status")
      .eq("payment_status", "paid")
      .eq("status", "approved")
      .not("membership_id", "is", null);

    if (error) {
      console.error("[member-count] Query failed:", error.message);
      return 0;
    }

    return (data ?? []).filter((row) => {
      if (!hasRealMembershipId(row.membership_id)) return false;
      if (row.user_id && adminIds.has(row.user_id)) return false;
      return true;
    }).length;
  } catch (err) {
    console.error("[member-count] Failed to load live count:", err);
    return 0;
  }
}
