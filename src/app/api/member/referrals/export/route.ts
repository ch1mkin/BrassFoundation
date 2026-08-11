import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const gender = searchParams.get("gender");
  const ageMin = searchParams.get("age_min");
  const ageMax = searchParams.get("age_max");
  const mandatesOnly = searchParams.get("mandates_only") === "1";

  const supabase = await createClient();
  const { data: me } = await supabase
    .from("membership_applications")
    .select("membership_id")
    .eq("user_id", user.id)
    .not("membership_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!me?.membership_id) {
    return NextResponse.json(
      { error: "Membership ID required." },
      { status: 400 },
    );
  }

  const admin = createServiceClient();
  const { data } = await admin
    .from("membership_applications")
    .select(
      "full_name, email, phone, membership_id, payment_status, status, gender, age, user_id, created_at",
    )
    .eq("referred_by_membership_id", me.membership_id)
    .order("created_at", { ascending: false })
    .limit(2000);

  const rows = data || [];
  const userIds = rows
    .map((r) => r.user_id)
    .filter((id): id is string => Boolean(id));
  const mandateUsers = new Set<string>();
  if (userIds.length) {
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

  let filtered = rows.map((r) => ({
    ...r,
    has_mandate: Boolean(r.user_id && mandateUsers.has(r.user_id)),
  }));

  if (from) {
    const d = new Date(from);
    filtered = filtered.filter((r) => new Date(r.created_at) >= d);
  }
  if (to) {
    const d = new Date(to);
    d.setHours(23, 59, 59, 999);
    filtered = filtered.filter((r) => new Date(r.created_at) <= d);
  }
  if (gender) {
    filtered = filtered.filter(
      (r) => (r.gender || "").toLowerCase() === gender.toLowerCase(),
    );
  }
  if (ageMin) {
    const n = Number(ageMin);
    filtered = filtered.filter((r) => typeof r.age === "number" && r.age >= n);
  }
  if (ageMax) {
    const n = Number(ageMax);
    filtered = filtered.filter((r) => typeof r.age === "number" && r.age <= n);
  }
  if (mandatesOnly) {
    filtered = filtered.filter((r) => r.has_mandate);
  }

  const header = [
    "full_name",
    "email",
    "phone",
    "membership_id",
    "age",
    "gender",
    "payment_status",
    "status",
    "contribution",
    "created_at",
  ];
  const lines = [
    header.join(","),
    ...filtered.map((r) =>
      [
        r.full_name,
        r.email,
        r.phone,
        r.membership_id,
        r.age,
        r.gender,
        r.payment_status,
        r.status,
        r.has_mandate ? "Contributed" : r.membership_id || r.payment_status === "paid" ? "Member" : "Pending",
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
      "Content-Disposition": `attachment; filename="referrals-${stamp}.csv"`,
    },
  });
}
