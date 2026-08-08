"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { MEMBERSHIP_CONSENT_VERSION } from "@/lib/membership/consent";
import { REGISTRATION_FEE_PAISE } from "@/lib/payments/constants";
import { MEMBERSHIP_CATEGORIES } from "@/lib/membership/categories";
import { readReferralCookie } from "@/lib/membership/referral";
import { z } from "zod";

export type RegisterMembershipState = {
  error?: string;
  success?: string;
  applicationId?: string;
  email?: string;
  fullName?: string;
  phone?: string;
};

const guestSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name with surname is required.")
    .max(120),
  email: z.string().email("Valid email is required."),
  phone: z.string().min(10, "Mobile number is required.").max(20),
  address: z.string().min(8, "Address is required.").max(500),
  category: z.enum(MEMBERSHIP_CATEGORIES, {
    message: "Select category: SC, ST, OBC, or General.",
  }),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirm_password: z.string().min(8),
  consent: z.enum(["on"], { message: "You must accept the consent form." }),
  signature_data_url: z
    .string()
    .min(40, "Digital signature is required."),
  avatar_data_url: z.string().optional(),
  referred_by_membership_id: z.string().optional(),
});

const loggedInSchema = guestSchema.omit({
  password: true,
  confirm_password: true,
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
    address: string;
    category: string;
    signature_data_url: string;
    referred_by_membership_id?: string | null;
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

  const payload = {
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    category: data.category,
    government_id: null,
    consent_accepted_at: new Date().toISOString(),
    consent_version: MEMBERSHIP_CONSENT_VERSION,
    signature_data_url: data.signature_data_url,
    registration_fee_paise: REGISTRATION_FEE_PAISE,
    payment_status: "unpaid",
    status: "pending",
    referred_by_membership_id: data.referred_by_membership_id || null,
  };

  if (existing && existing.payment_status !== "paid") {
    await admin
      .from("membership_applications")
      .update(payload)
      .eq("id", existing.id);
    return { applicationId: existing.id as string } as const;
  }

  const { data: application, error: appError } = await admin
    .from("membership_applications")
    .insert({
      user_id: userId,
      membership_type: "general",
      education: "—",
      occupation: "—",
      district: "—",
      state: "—",
      reason_for_joining: "Registered via membership payment flow.",
      member_status: "active",
      ...payload,
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

  const avatarRaw = String(formData.get("avatar_data_url") || "").trim();
  const referredFromForm = String(
    formData.get("referred_by_membership_id") || "",
  )
    .trim()
    .toUpperCase();
  const referredFromCookie = await readReferralCookie();

  const raw = {
    full_name: String(formData.get("full_name") || "").trim(),
    email: String(formData.get("email") || "")
      .trim()
      .toLowerCase(),
    phone: String(formData.get("phone") || "").trim(),
    address: String(formData.get("address") || "").trim(),
    category: String(formData.get("category") || "").trim().toUpperCase(),
    password: String(formData.get("password") || ""),
    confirm_password: String(formData.get("confirm_password") || ""),
    consent: formData.get("consent") === "on" ? "on" : "",
    signature_data_url: String(formData.get("signature_data_url") || ""),
    avatar_data_url: avatarRaw || undefined,
    referred_by_membership_id:
      referredFromForm || referredFromCookie || undefined,
  };

  if (!sessionUser && raw.password !== raw.confirm_password) {
    return { error: "Passwords do not match." };
  }

  const parsed = sessionUser
    ? loggedInSchema.safeParse(raw)
    : guestSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid form." };
  }

  const data = parsed.data;
  const admin = createServiceClient();

  let userId = sessionUser?.id ?? null;

  if (!userId) {
    const password = String(raw.password || "");
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: data.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: data.full_name },
      });

    if (createError || !created.user) {
      const msg = (createError?.message || "").toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password,
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
        password,
      });
      if (signInError) {
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

  let avatarUrl: string | null = null;
  if (data.avatar_data_url && data.avatar_data_url.length > 40) {
    avatarUrl = await uploadAvatarFromDataUrl(
      admin,
      userId,
      data.avatar_data_url,
    );
  }

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
  revalidatePath("/admin/referrals");
  revalidatePath("/");

  return {
    success: "Account ready. Complete ₹10 payment to activate membership.",
    applicationId: ensured.applicationId,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
  };
}
