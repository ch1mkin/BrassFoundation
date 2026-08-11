import { NextResponse } from "next/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const gender = searchParams.get("gender");
  const ageMin = searchParams.get("age_min");
  const ageMax = searchParams.get("age_max");
  const mandatesOnly = searchParams.get("mandates_only") === "1";
  const referrer = searchParams.get("referrer");
  const q = searchParams.get("q");

  const supabase = await createClient();
  let query = supabase
    .from("membership_applications")
    .select(
      "full_name, email, phone, membership_id, referred_by_membership_id, payment_status, status, gender, age, user_id, created_at",
    )
    .not("referred_by_membership_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (referrer?.trim()) {
    query = query.eq(
      "referred_by_membership_id",
      referrer.trim().toUpperCase(),
    );
  }
  if (q?.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(
      `full_name.ilike.${term},email.ilike.${term},membership_id.ilike.${term}`,
    );
  }

  const { data } = await query;
  let rows = data || [];

  const userIds = rows
    .map((r) => r.user_id)
    .filter((id): id is string => Boolean(id));
  const mandateUsers = new Set<string>();
  if (userIds.length) {
    const admin = createServiceClient();
    const { data: mandates } = await admin
      .from("payment_mandates")
      .select("user_id, status")
      .in("user_id", userIds);
    for (const m of mandates || []) {
      if (
        m.user_id &&
        ["authenticated", "active", "completed"].includes(
          String(m.status || "").toLowerCase(),
        )
      ) {
        mandateUsers.add(m.user_id);
      }
    }
  }

  if (from) {
    const d = new Date(from);
    rows = rows.filter((r) => new Date(r.created_at) >= d);
  }
  if (to) {
    const d = new Date(to);
    d.setHours(23, 59, 59, 999);
    rows = rows.filter((r) => new Date(r.created_at) <= d);
  }
  if (gender) {
    rows = rows.filter(
      (r) => (r.gender || "").toLowerCase() === gender.toLowerCase(),
    );
  }
  if (ageMin) {
    const n = Number(ageMin);
    rows = rows.filter((r) => typeof r.age === "number" && r.age >= n);
  }
  if (ageMax) {
    const n = Number(ageMax);
    rows = rows.filter((r) => typeof r.age === "number" && r.age <= n);
  }
  if (mandatesOnly) {
    rows = rows.filter((r) => r.user_id && mandateUsers.has(r.user_id));
  }

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
        r.user_id && mandateUsers.has(r.user_id)
          ? "Contributed"
          : r.membership_id || r.payment_status === "paid"
            ? "Member"
            : "Pending",
        r.created_at,
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="referral-report-${stamp}.csv"`,
    },
  });
}
