"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/auth/phone";

export type AuthActionState = {
  error?: string;
  success?: string;
  step?: "credentials" | "otp";
  phone?: string;
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
    phone,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(safeNext(next));
}

export async function sendSignupOtpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = String(formData.get("full_name") || "").trim();
  const phoneRaw = String(formData.get("phone") || "");
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");
  const phone = normalizePhone(phoneRaw);

  if (!fullName) {
    return { error: "Full name is required.", step: "credentials" };
  }

  if (!phone) {
    return {
      error: "Enter a valid phone number (e.g. 9876543210).",
      step: "credentials",
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
      step: "credentials",
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      step: "credentials",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      data: {
        full_name: fullName,
        pending_password_set: true,
      },
      channel: "sms",
    },
  });

  if (error) {
    return {
      error: error.message,
      step: "credentials",
      phone,
    };
  }

  return {
    success: "OTP sent to your phone. Enter the code to finish signup.",
    step: "otp",
    phone,
  };
}

export async function verifySignupOtpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const phoneRaw = String(formData.get("phone") || "");
  const token = String(formData.get("otp") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const next = String(formData.get("next") || "/member");
  const phone = normalizePhone(phoneRaw);

  if (!phone || !token) {
    return {
      error: "Phone and OTP are required.",
      step: "otp",
      phone: phoneRaw,
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
      step: "otp",
      phone,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    return { error: error.message, step: "otp", phone };
  }

  if (!data.session) {
    return {
      error: "OTP verified but session was not created. Try again.",
      step: "otp",
      phone,
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password,
    data: {
      full_name: fullName,
      phone,
      pending_password_set: false,
    },
  });

  if (updateError) {
    return { error: updateError.message, step: "otp", phone };
  }

  // Ensure profile has phone + name
  if (data.user) {
    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
      })
      .eq("id", data.user.id);
  }

  redirect(safeNext(next));
}

export async function resendSignupOtpAction(
  phoneRaw: string,
): Promise<AuthActionState> {
  const phone = normalizePhone(phoneRaw);
  if (!phone) {
    return { error: "Invalid phone number.", step: "otp" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { channel: "sms" },
  });

  if (error) {
    return { error: error.message, step: "otp", phone };
  }

  return {
    success: "A new OTP has been sent.",
    step: "otp",
    phone,
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
