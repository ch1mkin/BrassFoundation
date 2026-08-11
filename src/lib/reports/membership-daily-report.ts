import { createServiceClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/constants";
import { buildBrandedTablePdf } from "@/lib/reports/pdf-table";

export type MembershipReportRow = {
  full_name: string;
  email: string | null;
  phone: string | null;
  membership_id: string | null;
  age: number | null;
  gender: string | null;
  payment_status: string | null;
  status: string | null;
  created_at: string;
};

/** IST calendar day window for "yesterday" ending at midnight IST. */
export function istDayWindow(reference = new Date()) {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(reference.getTime() + istOffsetMs);
  const y = istNow.getUTCFullYear();
  const m = istNow.getUTCMonth();
  const d = istNow.getUTCDate();
  const startOfTodayIstUtc = Date.UTC(y, m, d) - istOffsetMs;
  const startOfYesterdayIstUtc = startOfTodayIstUtc - 24 * 60 * 60 * 1000;
  return {
    from: new Date(startOfYesterdayIstUtc),
    to: new Date(startOfTodayIstUtc),
    label: new Date(startOfYesterdayIstUtc + istOffsetMs)
      .toISOString()
      .slice(0, 10),
  };
}

export async function fetchMembershipRows(input?: {
  from?: Date;
  to?: Date;
}): Promise<MembershipReportRow[]> {
  const admin = createServiceClient();
  let query = admin
    .from("membership_applications")
    .select(
      "full_name, email, phone, membership_id, age, gender, payment_status, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  if (input?.from) {
    query = query.gte("created_at", input.from.toISOString());
  }
  if (input?.to) {
    query = query.lt("created_at", input.to.toISOString());
  }

  const { data } = await query;
  return (data || []) as MembershipReportRow[];
}

export async function buildMembershipReportPdf(input: {
  rows: MembershipReportRow[];
  generatedAt: Date;
  periodLabel: string;
}): Promise<Buffer> {
  return buildBrandedTablePdf({
    title: `${SITE.name} — Membership report`,
    metaLines: [
      `Period: ${input.periodLabel} (IST)`,
      `Generated: ${input.generatedAt.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })} IST`,
      `Total registrations: ${input.rows.length}`,
    ],
    columns: [
      { key: "full_name", header: "Name", weight: 2.4 },
      { key: "age", header: "Age", weight: 0.7 },
      { key: "gender", header: "Gender", weight: 0.9 },
      { key: "membership_id", header: "Membership ID", weight: 1.6 },
      { key: "status", header: "Status", weight: 1.1 },
      { key: "registered", header: "Registered (IST)", weight: 1.8 },
    ],
    rows: input.rows.map((row) => ({
      full_name: row.full_name,
      age: row.age,
      gender: row.gender,
      membership_id: row.membership_id,
      status: row.payment_status || row.status,
      registered: new Date(row.created_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      }),
    })),
    emptyMessage: "No registrations in this period.",
  });
}
