import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

/** Paid primary members + paid/waived family members. */
export async function getLiveMemberCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const [{ count: primary }, { count: family }] = await Promise.all([
      supabase
        .from("membership_applications")
        .select("id", { count: "exact", head: true })
        .or("payment_status.eq.paid,membership_id.not.is.null"),
      supabase
        .from("family_members")
        .select("id", { count: "exact", head: true })
        .in("payment_status", ["paid", "waived"]),
    ]);
    return (primary || 0) + (family || 0);
  } catch {
    try {
      const admin = createServiceClient();
      const { count } = await admin
        .from("membership_applications")
        .select("id", { count: "exact", head: true })
        .or("payment_status.eq.paid,membership_id.not.is.null");
      return count || 0;
    } catch {
      return 0;
    }
  }
}
