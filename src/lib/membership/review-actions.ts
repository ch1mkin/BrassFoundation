"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";

export type MembershipReviewState = {
  error?: string;
  success?: string;
};

async function requireAdmin() {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return null;
  }
  return context;
}

async function writeApplication(
  applicationId: string,
  payload: Record<string, unknown>,
) {
  const supabase = await createClient();
  const first = await supabase
    .from("membership_applications")
    .update(payload)
    .eq("id", applicationId);

  if (!first.error) return null;

  try {
    const admin = createServiceClient();
    const second = await admin
      .from("membership_applications")
      .update(payload)
      .eq("id", applicationId);
    return second.error?.message ?? null;
  } catch {
    return first.error.message;
  }
}

export async function approveMembershipAction(
  _prev: MembershipReviewState,
  formData: FormData,
): Promise<MembershipReviewState> {
  const context = await requireAdmin();
  if (!context) return { error: "Unauthorized." };

  const applicationId = String(formData.get("application_id") || "");
  if (!applicationId) return { error: "Missing application id." };

  const year = new Date().getFullYear();
  const membershipId = `BF-${year}-${String(Date.now()).slice(-6)}`;

  const error = await writeApplication(applicationId, {
    status: "approved",
    membership_id: membershipId,
    qr_payload: membershipId,
    reviewed_by: context.userId,
    reviewed_at: new Date().toISOString(),
    approved_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  });

  if (error) return { error };

  revalidatePath("/admin/members");
  revalidatePath("/member");
  return { success: `Approved — ID ${membershipId}` };
}

export async function rejectMembershipAction(
  _prev: MembershipReviewState,
  formData: FormData,
): Promise<MembershipReviewState> {
  const context = await requireAdmin();
  if (!context) return { error: "Unauthorized." };

  const applicationId = String(formData.get("application_id") || "");
  if (!applicationId) return { error: "Missing application id." };

  const error = await writeApplication(applicationId, {
    status: "rejected",
    reviewed_by: context.userId,
    reviewed_at: new Date().toISOString(),
  });

  if (error) return { error };

  revalidatePath("/admin/members");
  revalidatePath("/member");
  return { success: "Application rejected." };
}
