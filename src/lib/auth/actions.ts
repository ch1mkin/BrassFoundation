"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone, phoneToAuthEmail } from "@/lib/auth/phone";

export type AuthActionState = {
  error?: string;
  success?: string;
};

function safeNext(next: string) {
  return next.startsWith("/") ? next : "/member";
}

export async function signInWithPhoneAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const phoneRaw = String(formData.get("phone") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/member");
  const phone = normalizePhone(phoneRaw);

  if (!phone || !password) {
    return { error: "Phone number and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: phoneToAuthEmail(phone),
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(safeNext(next));
}

export async function signUpWithPhoneAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = String(formData.get("full_name") || "").trim();
  const phoneRaw = String(formData.get("phone") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");
  const next = String(formData.get("next") || "/member");
  const phone = normalizePhone(phoneRaw);

  if (!fullName) {
    return { error: "Full name is required." };
  }

  if (!phone) {
    return { error: "Enter a valid phone number (e.g. 9876543210)." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const email = phoneToAuthEmail(phone);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is off, session is returned and user is signed in.
  if (data.session && data.user) {
    await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", data.user.id);

    redirect(safeNext(next));
  }

  // Fallback: sign in immediately (covers confirm-email-disabled setups)
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      error:
        signInError.message ||
        "Account created. Please sign in with your phone and password.",
    };
  }

  if (data.user) {
    await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", data.user.id);
  }

  redirect(safeNext(next));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
