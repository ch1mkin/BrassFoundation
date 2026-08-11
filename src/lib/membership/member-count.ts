import { createServiceClient } from "@/lib/supabase/admin";

/** Staff / admin portal roles — never counted as public members. */
const ADMIN_ROLE_SLUGS = [
  "super_admin",
  "admin",
  "secretary",
  "treasurer",
] as const;

/** Primary membership IDs look like BF-2026-123456 */
function hasPrimaryMembershipId(value: string | null | undefined): boolean {
  const id = String(value || "").trim();
  if (!id) return false;
  return /^BF-\d{4}-\d+$/i.test(id);
}

/** Family membership IDs look like BF-F-… */
function hasFamilyMembershipId(value: string | null | undefined): boolean {
  const id = String(value || "").trim();
  if (!id) return false;
  return /^BF-F-/i.test(id) && id.length >= 10;
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
 * Primary members: paid + approved + real BF-YYYY-… ID (admins excluded).
 * Family members: paid or waived + real BF-F-… ID (admin parents excluded).
 */
export async function getLiveMemberCount(): Promise<number> {
  try {
    const admin = createServiceClient();
    const adminIds = await getAdminUserIds();

    const [primaryRes, familyRes] = await Promise.all([
      admin
        .from("membership_applications")
        .select("id, user_id, membership_id, payment_status, status")
        .eq("payment_status", "paid")
        .eq("status", "approved")
        .not("membership_id", "is", null),
      admin
        .from("family_members")
        .select("id, parent_user_id, membership_id, payment_status")
        .in("payment_status", ["paid", "waived"])
        .not("membership_id", "is", null),
    ]);

    if (primaryRes.error) {
      console.error("[member-count] Primary query failed:", primaryRes.error.message);
    }
    if (familyRes.error) {
      console.error("[member-count] Family query failed:", familyRes.error.message);
    }

    const primaryCount = (primaryRes.data ?? []).filter((row) => {
      if (!hasPrimaryMembershipId(row.membership_id)) return false;
      if (row.user_id && adminIds.has(row.user_id)) return false;
      return true;
    }).length;

    const familyCount = (familyRes.data ?? []).filter((row) => {
      if (!hasFamilyMembershipId(row.membership_id)) return false;
      if (row.parent_user_id && adminIds.has(row.parent_user_id)) return false;
      return true;
    }).length;

    return primaryCount + familyCount;
  } catch (err) {
    console.error("[member-count] Failed to load live count:", err);
    return 0;
  }
}
