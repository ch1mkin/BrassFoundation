import PDFDocument from "pdfkit";
import { createServiceClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/constants";

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
  // Midnight IST for "today" as UTC
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
  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc
    .fontSize(18)
    .text(`${SITE.name} — Membership report`, { align: "left" });
  doc.moveDown(0.4);
  doc
    .fontSize(10)
    .fillColor("#444")
    .text(`Period: ${input.periodLabel} (IST)`)
    .text(
      `Generated: ${input.generatedAt.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })} IST`,
    )
    .text(`Total registrations listed: ${input.rows.length}`);
  doc.moveDown();
  doc.fillColor("#000");

  const header =
    "Name | Age | Gender | Membership ID | Status | Registered";
  doc.fontSize(9).text(header, { underline: true });
  doc.moveDown(0.3);

  for (const row of input.rows) {
    const line = [
      row.full_name || "—",
      row.age ?? "—",
      row.gender || "—",
      row.membership_id || "—",
      row.payment_status || row.status || "—",
      new Date(row.created_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    ].join(" | ");
    doc.fontSize(8).text(line, { width: 520 });
    doc.moveDown(0.15);
  }

  if (!input.rows.length) {
    doc.fontSize(11).text("No registrations in this period.");
  }

  doc.end();
  return done;
}
