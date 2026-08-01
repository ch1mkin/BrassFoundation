"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  membershipApplicationSchema,
  type MembershipApplicationInput,
} from "@/lib/membership/schema";

export type MembershipActionState = {
  error?: string;
  success?: string;
  applicationId?: string;
};

export async function submitMembershipApplicationAction(
  _prev: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const raw: MembershipApplicationInput = {
    full_name: String(formData.get("full_name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    phone: String(formData.get("phone") || "").trim(),
    date_of_birth: String(formData.get("date_of_birth") || "").trim() || undefined,
    gender: String(formData.get("gender") || "").trim() || undefined,
    education: String(formData.get("education") || "").trim(),
    occupation: String(formData.get("occupation") || "").trim(),
    district: String(formData.get("district") || "").trim(),
    state: String(formData.get("state") || "").trim(),
    address: String(formData.get("address") || "").trim() || undefined,
    interests: String(formData.get("interests") || "").trim() || undefined,
    reason_for_joining: String(formData.get("reason_for_joining") || "").trim(),
    membership_type: String(
      formData.get("membership_type") || "general",
    ) as MembershipApplicationInput["membership_type"],
  };

  const parsed = membershipApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid form data." };
  }

  const user = await getSessionUser();
  const data = parsed.data;
  const interests = data.interests
    ? data.interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("membership_applications")
    .insert({
      user_id: user?.id ?? null,
      membership_type: data.membership_type,
      status: "pending",
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      education: data.education,
      occupation: data.occupation,
      district: data.district,
      state: data.state,
      address: data.address || null,
      interests,
      reason_for_joining: data.reason_for_joining,
    })
    .select("id")
    .single();

  if (error) {
    return {
      error:
        error.message.includes("membership_applications")
          ? "Membership table is not set up yet. Run the membership SQL migration in Supabase."
          : error.message,
    };
  }

  revalidatePath("/admin/members");
  return {
    success:
      "Application submitted. Our team will review it and notify you by email.",
    applicationId: row.id,
  };
}
