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
  avatar_data_url: z
    .string()
    .min(40, "Please take a selfie or upload a profile photo."),
});

async function uploadAvatarFromDataUrl(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  userId: string,
  dataUrl: string,
): Promise<string | null> {
  const match = dataUrl.match(
    /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i,
  );
  if (!match) return null;

  const contentType = match[1].toLowerCase().replace("image/jpg", "image/jpeg");
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) return null;

  const ext =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${userId}/avatar.${ext}`;

  const { error } = await admin.storage.from("avatars").upload(path, buffer, {
    contentType,
    upsert: true,
    cacheControl: "3600",
  });
  if (error) return null;

  const { data } = admin.storage.from("avatars").getPublicUrl(path);
  return data?.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : null;
}

async function ensureApplication(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  userId: string,
  data: {
    full_name: string;
    email: string;
    phone: string;
    government_id: string;
    signature_data_url: string;
  },
) {
  const { data: existing } = await admin
    .from("membership_applications")
    .select("id, status, payment_status, membership_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    existing &&
    (existing.payment_status === "paid" || existing.membership_id)
  ) {
    return {
      error: "You are already a member. Open the member portal to continue.",
    } as const;
  }

  if (existing && existing.payment_status !== "paid") {
    await admin
      .from("membership_applications")
      .update({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        government_id: data.government_id,
        consent_accepted_at: new Date().toISOString(),
        consent_version: MEMBERSHIP_CONSENT_VERSION,
        signature_data_url: data.signature_data_url,
        registration_fee_paise: REGISTRATION_FEE_PAISE,
        payment_status: "unpaid",
        status: "pending",
      })
      .eq("id", existing.id);
    return { applicationId: existing.id as string } as const;
  }

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
        "Could not create membership record. Please try again.",
    } as const;
  }

  return { applicationId: application.id as string } as const;
}

export async function registerMembershipAction(
  _prev: RegisterMembershipState,
  formData: FormData,
): Promise<RegisterMembershipState> {
  const supabase = await createClient();

  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  const raw = {
    full_name: String(formData.get("full_name") || "").trim(),
    email: String(formData.get("email") || "")
      .trim()
      .toLowerCase(),
    government_id: String(formData.get("government_id") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    password: String(formData.get("password") || ""),
    confirm_password: String(formData.get("confirm_password") || ""),
    consent: formData.get("consent") === "on" ? "on" : "",
    signature_data_url: String(formData.get("signature_data_url") || ""),
    avatar_data_url: String(formData.get("avatar_data_url") || ""),
  };

  // Logged-in users completing membership don't need a new password.
  if (sessionUser) {
    if (!raw.password) {
      raw.password = "LoggedInUser1";
      raw.confirm_password = "LoggedInUser1";
    }
  }

  if (raw.password !== raw.confirm_password) {
    return { error: "Passwords do not match." };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  const data = parsed.data;
  const admin = createServiceClient();

  let userId = sessionUser?.id ?? null;

  if (!userId) {
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: { full_name: data.full_name },
      });

    if (createError || !created.user) {
      const msg = (createError?.message || "").toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (signInError) {
          return {
            error:
              "An account with this email already exists. Log in with that password, then open Become a Member to finish payment — or use Forgot Password.",
          };
        }
        const {
          data: { user: signedIn },
        } = await supabase.auth.getUser();
        userId = signedIn?.id ?? null;
        if (!userId) {
          return { error: "Could not sign you in. Please try logging in." };
        }
      } else {
        return { error: createError?.message || "Could not create account." };
      }
    } else {
      userId = created.user.id;
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) {
        // Account exists; try to continue after they log in manually.
        const ensured = await ensureApplication(admin, userId, data);
        if ("error" in ensured && ensured.error) {
          return { error: ensured.error, applicationId: undefined };
        }
        return {
          error:
            "Account created. Please log in, then open Membership to finish the ₹10 payment.",
          applicationId:
            "applicationId" in ensured ? ensured.applicationId : undefined,
        };
      }
    }
  }

  if (!userId) {
    return { error: "Could not create or sign in to your account." };
  }

  const avatarUrl = await uploadAvatarFromDataUrl(
    admin,
    userId,
    data.avatar_data_url,
  );

  await admin
    .from("profiles")
    .update({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", userId);

  if (avatarUrl) {
    await admin
      .from("org_nodes")
      .update({ avatar_url: avatarUrl })
      .eq("profile_id", userId);
  }

  const ensured = await ensureApplication(admin, userId, data);
  if ("error" in ensured && ensured.error) {
    return { error: ensured.error };
  }

  revalidatePath("/member");
  revalidatePath("/membership");
  revalidatePath("/admin/members");
  revalidatePath("/admin/family");

  return {
    success: "Account ready. Complete ₹10 payment to activate membership.",
    applicationId: ensured.applicationId,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
  };
}
