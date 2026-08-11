"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isMembershipCategory } from "@/lib/membership/categories";
import { ageFromIsoDate, dobError } from "@/lib/membership/dob";
import {
  FAMILY_MEMBER_FEE_PAISE,
  FAMILY_MINOR_AGE,
} from "@/lib/payments/constants";

export type FamilyActionState = {
  error?: string;
  success?: string;
  batchId?: string;
  totalPaise?: number;
  familyIds?: string[];
};

type FamilyInput = {
  full_name: string;
  date_of_birth: string;
  age: number;
  gender: string;
  occupation: string;
  category: string;
};

export async function createFamilyMembersAction(
  _prev: FamilyActionState,
  formData: FormData,
): Promise<FamilyActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };

  const admin = createServiceClient();
  const { data: parentApp } = await admin
    .from("membership_applications")
    .select("id, membership_id, payment_status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!parentApp || !(parentApp.payment_status === "paid" || parentApp.membership_id)) {
    return { error: "Only active members can add family members." };
  }

  const count = Number(formData.get("member_count") || 0);
  if (!count || count < 1 || count > 12) {
    return { error: "Add between 1 and 12 family members." };
  }

  const members: FamilyInput[] = [];
  for (let i = 0; i < count; i++) {
    const full_name = String(formData.get(`full_name_${i}`) || "").trim();
    const date_of_birth = String(formData.get(`date_of_birth_${i}`) || "").trim();
    const gender = String(formData.get(`gender_${i}`) || "").trim();
    const occupation = String(formData.get(`occupation_${i}`) || "").trim();
    const category = String(formData.get(`category_${i}`) || "")
      .trim()
      .toUpperCase();

    const dobIssue = dobError(date_of_birth, { minAge: 0, maxAge: 119 });
    const age = ageFromIsoDate(date_of_birth);

    if (
      !full_name ||
      dobIssue ||
      age === null ||
      !gender ||
      !isMembershipCategory(category)
    ) {
      return {
        error:
          dobIssue ||
          `Please complete all required fields for member #${i + 1}.`,
      };
    }
    members.push({
      full_name,
      date_of_birth,
      age,
      gender,
      occupation,
      category,
    });
  }

  const rows = members.map((m) => {
    const minor = m.age < FAMILY_MINOR_AGE;
    return {
      parent_user_id: user.id,
      parent_application_id: parentApp.id,
      parent_membership_id: parentApp.membership_id,
      full_name: m.full_name,
      date_of_birth: m.date_of_birth,
      age: m.age,
      gender: m.gender,
      occupation: m.occupation || null,
      category: m.category,
      fee_paise: minor ? 0 : FAMILY_MEMBER_FEE_PAISE,
      payment_status: minor ? "waived" : "unpaid",
      membership_id: minor
        ? `BF-F-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`
        : null,
    };
  });

  const { data: inserted, error } = await admin
    .from("family_members")
    .insert(rows)
    .select("id, fee_paise, payment_status");

  if (error || !inserted) {
    if (error && /date_of_birth/i.test(error.message)) {
      const withoutDob = rows.map((row) => {
        // Retry without DOB when the column is missing in older DBs.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { date_of_birth, ...rest } = row;
        return rest;
      });
      const retry = await admin
        .from("family_members")
        .insert(withoutDob)
        .select("id, fee_paise, payment_status");
      if (retry.error || !retry.data) {
        return {
          error:
            retry.error?.message ||
            "Could not save family members. Run migration 20260811100000_family_members_dob.sql, then try again.",
        };
      }
      return finishFamilySave(retry.data);
    }
    return { error: error?.message || "Could not save family members." };
  }

  return finishFamilySave(inserted);
}

function finishFamilySave(
  inserted: { id: string; fee_paise: number | null; payment_status: string }[],
): FamilyActionState {
  const payable = inserted.filter((r) => r.payment_status === "unpaid");
  const totalPaise = payable.reduce((sum, r) => sum + (r.fee_paise || 0), 0);

  revalidatePath("/member/family");
  revalidatePath("/admin/family-members");
  revalidatePath("/");

  if (totalPaise <= 0) {
    return {
      success: "Family members added. No fee for members under 18.",
      familyIds: inserted.map((r) => r.id),
      totalPaise: 0,
    };
  }

  return {
    success: `Family saved. Adults stay unpaid until you pay — use Pay on each card or Pay all unpaid when ready.`,
    familyIds: payable.map((r) => r.id),
    totalPaise,
  };
}
