import PDFDocument from "pdfkit";
import { SITE } from "@/lib/constants";

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
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc
    .fontSize(18)
    .fillColor("#000")
    .text(`${SITE.name} — Referral report`, { align: "left" });
  doc.moveDown(0.4);
  doc
    .fontSize(10)
    .fillColor("#444")
    .text(
      `Generated: ${generatedAt.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })} IST`,
    )
    .text(`Rows: ${input.rows.length}`)
    .text(input.filtersLabel || "Filters: none");
  doc.moveDown();
  doc.fillColor("#000");

  doc
    .fontSize(9)
    .text(
      "Name | Age | Gender | Membership ID | Referred by | Status | Joined",
      { underline: true },
    );
  doc.moveDown(0.35);

  for (const row of input.rows) {
    const line = [
      row.full_name || "—",
      row.age ?? "—",
      row.gender || "—",
      row.membership_id || "—",
      row.referred_by_membership_id || "—",
      row.contribution || row.payment_status || row.status || "—",
      new Date(row.created_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    ].join(" | ");
    doc.fontSize(8).text(line, { width: 520 });
    doc.moveDown(0.15);
  }

  if (!input.rows.length) {
    doc.fontSize(11).text("No referral registrations match these filters.");
  }

  doc.end();
  return done;
}
