import { SITE } from "@/lib/constants";
import { buildSimpleTablePdf } from "@/lib/reports/pdf-table";

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
  return buildSimpleTablePdf({
    title: `${SITE.name} — Referral report`,
    metaLines: [
      `Generated: ${generatedAt.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })} IST`,
      `Rows: ${input.rows.length}`,
      input.filtersLabel || "Filters: none",
    ],
    header:
      "Name | Age | Gender | Membership ID | Referred by | Status | Joined",
    lines: input.rows.map((row) =>
      [
        row.full_name || "—",
        row.age ?? "—",
        row.gender || "—",
        row.membership_id || "—",
        row.referred_by_membership_id || "—",
        row.contribution || row.payment_status || row.status || "—",
        new Date(row.created_at).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      ].join(" | "),
    ),
    emptyMessage: "No referral registrations match these filters.",
  });
}
