import { createServiceClient } from "@/lib/supabase/admin";

/** Staff / admin portal roles — never counted as public members. */
const ADMIN_ROLE_SLUGS = [
  "super_admin",
  "admin",
  "secretary",
  "treasurer",
] as const;

/** Primary membership IDs look like BF-2026-123456 */
export function hasPrimaryMembershipId(value: string | null | undefined): boolean {
  const id = String(value || "").trim();
  if (!id) return false;
  return /^BF-\d{4}-\d+$/i.test(id);
}

/** Family membership IDs look like BF-F-… */
export function hasFamilyMembershipId(value: string | null | undefined): boolean {
  const id = String(value || "").trim();
  if (!id) return false;
  return /^BF-F-/i.test(id) && id.length >= 10;
}

export function isPaidFamilyStatus(status: string | null | undefined): boolean {
  return status === "paid" || status === "waived";
}

export function isUnpaidFamilyStatus(status: string | null | undefined): boolean {
  return status === "unpaid" || status === "pending";
}

export type MembershipStats = {
  /** Paid + approved primary members with real BF-YYYY-… IDs */
  primaryMembers: number;
  /** Paid/waived family members with BF-F-… IDs */
  paidFamilyMembers: number;
  /** Saved family adults awaiting payment (unpaid/pending) */
  unpaidFamilyMembers: number;
  /** Public live total = primary + paid family */
  totalMemberships: number;
};

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
 * Breakdown used by homepage live counter and admin dashboards.
 */
export async function getMembershipStats(): Promise<MembershipStats> {
  const empty: MembershipStats = {
    primaryMembers: 0,
    paidFamilyMembers: 0,
    unpaidFamilyMembers: 0,
    totalMemberships: 0,
  };

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
        .select("id, parent_user_id, membership_id, payment_status"),
    ]);

    if (primaryRes.error) {
      console.error(
        "[member-count] Primary query failed:",
        primaryRes.error.message,
      );
    }
    if (familyRes.error) {
      console.error(
        "[member-count] Family query failed:",
        familyRes.error.message,
      );
    }

    const primaryMembers = (primaryRes.data ?? []).filter((row) => {
      if (!hasPrimaryMembershipId(row.membership_id)) return false;
      if (row.user_id && adminIds.has(row.user_id)) return false;
      return true;
    }).length;

    const familyRows = (familyRes.data ?? []).filter((row) => {
      if (row.parent_user_id && adminIds.has(row.parent_user_id)) return false;
      return true;
    });

    const paidFamilyMembers = familyRows.filter(
      (row) =>
        isPaidFamilyStatus(row.payment_status) &&
        hasFamilyMembershipId(row.membership_id),
    ).length;

    const unpaidFamilyMembers = familyRows.filter((row) =>
      isUnpaidFamilyStatus(row.payment_status),
    ).length;

    return {
      primaryMembers,
      paidFamilyMembers,
      unpaidFamilyMembers,
      totalMemberships: primaryMembers + paidFamilyMembers,
    };
  } catch (err) {
    console.error("[member-count] Failed to load membership stats:", err);
    return empty;
  }
}

/** Exact public member total for the homepage live counter. */
export async function getLiveMemberCount(): Promise<number> {
  const stats = await getMembershipStats();
  return stats.totalMemberships;
}
