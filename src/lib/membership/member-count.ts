import { createServiceClient } from "@/lib/supabase/admin";

/**
 * Public website member count — always uses the service role so the number
 * does not change with login/logout (RLS would otherwise hide others' rows).
 * Counts only fully activated members: paid + approved + membership ID.
 */
export async function getLiveMemberCount(): Promise<number> {
  try {
    const admin = createServiceClient();
    const [{ count: primary }, { count: family }] = await Promise.all([
      admin
        .from("membership_applications")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "paid")
        .eq("status", "approved")
        .not("membership_id", "is", null),
      admin
        .from("family_members")
        .select("id", { count: "exact", head: true })
        .in("payment_status", ["paid", "waived"])
        .not("membership_id", "is", null),
    ]);
    return (primary || 0) + (family || 0);
  } catch (err) {
    console.error("[member-count] Failed to load live count:", err);
    return 0;
  }
}
