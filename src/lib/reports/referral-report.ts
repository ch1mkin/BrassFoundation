import { SITE } from "@/lib/constants";
import { buildBrandedTablePdf } from "@/lib/reports/pdf-table";

export type ReferralReportRow = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  membership_id: string | null;
  referred_by_membership_id: string | null;
  age: number | null;
  gender: string | null;
  payment_status: string | null;
  status: string | null;
  contribution: string;
  created_at: string;
};

export function referralRowsToCsv(rows: ReferralReportRow[]): string {
  const header = [
    "full_name",
    "email",
    "phone",
    "membership_id",
    "referred_by",
    "age",
    "gender",
    "payment_status",
    "status",
    "contribution",
    "created_at",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.full_name,
        r.email,
        r.phone,
        r.membership_id,
        r.referred_by_membership_id,
        r.age,
        r.gender,
        r.payment_status,
        r.status,
        r.contribution,
        r.created_at,
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];
  return lines.join("\n");
}

export async function buildReferralReportPdf(input: {
  rows: ReferralReportRow[];
  generatedAt?: Date;
  filtersLabel?: string;
}): Promise<Buffer> {
  const generatedAt = input.generatedAt || new Date();
  return buildBrandedTablePdf({
    title: `${SITE.name} — Referral report`,
    metaLines: [
      `Generated: ${generatedAt.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })} IST`,
      `Rows: ${input.rows.length}`,
      input.filtersLabel || "Filters: none",
    ],
    columns: [
      { key: "full_name", header: "Name", weight: 2.1 },
      { key: "age", header: "Age", weight: 0.6 },
      { key: "gender", header: "Gender", weight: 0.8 },
      { key: "membership_id", header: "Membership ID", weight: 1.4 },
      { key: "referred_by", header: "Referred by", weight: 1.4 },
      { key: "contribution", header: "Status", weight: 1.1 },
      { key: "joined", header: "Joined (IST)", weight: 1.5 },
    ],
    rows: input.rows.map((row) => ({
      full_name: row.full_name,
      age: row.age,
      gender: row.gender,
      membership_id: row.membership_id,
      referred_by: row.referred_by_membership_id,
      contribution: row.contribution || row.payment_status || row.status,
      joined: new Date(row.created_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      }),
    })),
    emptyMessage: "No referral registrations match these filters.",
  });
}
