"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { ageFromIsoDate, dobError } from "@/lib/membership/dob";
import { MEMBERSHIP_CATEGORIES } from "@/lib/membership/categories";
import { uploadAvatarFromDataUrl } from "@/lib/membership/upload-avatar";

export type UpdateProfileState = {
  error?: string;
  success?: string;
};

const GENDERS = ["Female", "Male", "Other"] as const;

const schema = z.object({
  first_name: z.string().min(1, "First name is required.").max(60),
  surname: z.string().min(1, "Surname is required.").max(60),
  phone: z.string().min(10, "Mobile number is required.").max(20),
  address: z.string().min(1, "Address is required.").max(500),
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required.")
    .superRefine((v, ctx) => {
      const err = dobError(v, { minAge: 1, maxAge: 119 });
      if (err) ctx.addIssue({ code: "custom", message: err });
    }),
  gender: z.enum(GENDERS, { message: "Select gender." }),
  category: z.enum(MEMBERSHIP_CATEGORIES, {
    message: "Select category: SC, ST, OBC, or General.",
  }),
  avatar_data_url: z.string().optional(),
});

export async function updateMemberProfileAction(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  try {
    const user = await getSessionUser();
    if (!user) return { error: "Please sign in to update your profile." };

    const firstName = String(formData.get("first_name") || "").trim();
    const surname = String(formData.get("surname") || "").trim();
    const avatarRaw = String(formData.get("avatar_data_url") || "").trim();
    const raw = {
      first_name: firstName,
      surname,
      phone: String(formData.get("phone") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      date_of_birth: String(formData.get("date_of_birth") || "").trim(),
      gender: String(formData.get("gender") || "").trim(),
      category: String(formData.get("category") || "").trim().toUpperCase(),
      avatar_data_url:
        avatarRaw.length > 40 && avatarRaw.startsWith("data:image/")
          ? avatarRaw
          : undefined,
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message || "Invalid profile data.",
      };
    }

    const data = parsed.data;
    const fullName = `${data.first_name} ${data.surname}`.trim();
    const age = ageFromIsoDate(data.date_of_birth);

    let avatarUrl: string | null | undefined;
    if (data.avatar_data_url) {
      avatarUrl = await uploadAvatarFromDataUrl(user.id, data.avatar_data_url);
      if (!avatarUrl) {
        return {
          error: "Could not upload photo. Use JPG, PNG, or WebP under 5MB.",
        };
      }
    }

    const supabase = await createClient();
    const profilePatch: Record<string, string | null> = {
      full_name: fullName,
      phone: data.phone,
    };
    if (avatarUrl) profilePatch.avatar_url = avatarUrl;

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profilePatch)
      .eq("id", user.id);

    if (profileError) {
      return { error: profileError.message || "Could not update profile." };
    }

    try {
      const admin = createServiceClient();
      const { data: app } = await admin
        .from("membership_applications")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (app?.id) {
        const appPatch: Record<string, string | number | null> = {
          full_name: fullName,
          phone: data.phone,
          address: data.address,
          date_of_birth: data.date_of_birth,
          age: age ?? null,
          gender: data.gender,
          category: data.category,
        };
        if (avatarUrl) appPatch.photo_url = avatarUrl;

        const { error: appError } = await admin
          .from("membership_applications")
          .update(appPatch)
          .eq("id", app.id);
        if (appError) {
          console.error("[profile] application update failed:", appError);
        }
      }

      const orgPatch: Record<string, string> = { full_name: fullName };
      if (avatarUrl) orgPatch.avatar_url = avatarUrl;
      await admin.from("org_nodes").update(orgPatch).eq("profile_id", user.id);
    } catch (adminErr) {
      // Profile row already saved — don't block the member on secondary sync.
      console.error("[profile] secondary sync failed:", adminErr);
    }

    revalidatePath("/member");
    revalidatePath("/member/profile");
    return { success: "Profile saved." };
  } catch (err) {
    console.error("[profile] update failed:", err);
    return {
      error:
        err instanceof Error
          ? err.message
          : "Could not save profile. Please try again.",
    };
  }
}
