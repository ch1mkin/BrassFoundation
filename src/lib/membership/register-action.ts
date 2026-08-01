"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { MEMBERSHIP_CONSENT_VERSION } from "@/lib/membership/consent";
import { REGISTRATION_FEE_PAISE } from "@/lib/payments/constants";
import { z } from "zod";

export type RegisterMembershipState = {
  error?: string;
  success?: string;
  applicationId?: string;
  email?: string;
  fullName?: string;
  phone?: string;
};

const schema = z.object({
  full_name: z.string().min(2, "Full name is required."),
  email: z.string().email("Valid email is required."),
  government_id: z.string().min(4, "Government / ID number is required."),
  phone: z.string().min(10, "Mobile number is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirm_password: z.string().min(8),
  consent: z.enum(["on"], { message: "You must accept the consent form." }),
  signature_data_url: z
    .string()
    .min(40, "Digital signature is required."),
});

export async function registerMembershipAction(
  _prev: RegisterMembershipState,
  formData: FormData,
): Promise<RegisterMembershipState> {
  const raw = {
    full_name: String(formData.get("full_name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    government_id: String(formData.get("government_id") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    password: String(formData.get("password") || ""),
    confirm_password: String(formData.get("confirm_password") || ""),
    consent: formData.get("consent") === "on" ? "on" : "",
    signature_data_url: String(formData.get("signature_data_url") || ""),
  };

  if (raw.password !== raw.confirm_password) {
    return { error: "Passwords do not match." };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  const data = parsed.data;
  const admin = createServiceClient();

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });

  if (createError || !created.user) {
    const msg = createError?.message || "Could not create account.";
    if (msg.toLowerCase().includes("already")) {
      return {
        error:
          "An account with this email already exists. Please log in, then complete membership payment from your portal.",
      };
    }
    return { error: msg };
  }

  const userId = created.user.id;

  await admin
    .from("profiles")
    .update({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
    })
    .eq("id", userId);

  const { data: application, error: appError } = await admin
    .from("membership_applications")
    .insert({
      user_id: userId,
      membership_type: "general",
      status: "pending",
      payment_status: "unpaid",
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      government_id: data.government_id,
      education: "—",
      occupation: "—",
      district: "—",
      state: "—",
      reason_for_joining: "Registered via membership payment flow.",
      consent_accepted_at: new Date().toISOString(),
      consent_version: MEMBERSHIP_CONSENT_VERSION,
      signature_data_url: data.signature_data_url,
      registration_fee_paise: REGISTRATION_FEE_PAISE,
      member_status: "active",
    })
    .select("id")
    .single();

  if (appError || !application) {
    return {
      error:
        appError?.message ||
        "Account created but membership record failed. Contact support.",
    };
  }

  // Sign the user in
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (signInError) {
    return {
      error:
        "Account created. Please log in, then open Membership to finish the ₹10 payment.",
      applicationId: application.id,
    };
  }

  revalidatePath("/member");
  revalidatePath("/admin/members");

  return {
    success: "Account ready. Complete ₹10 payment to activate membership.",
    applicationId: application.id,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
  };
}
