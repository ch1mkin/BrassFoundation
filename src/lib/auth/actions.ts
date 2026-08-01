"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/smtp";
import {
  passwordResetEmailHtml,
  welcomeEmailHtml,
} from "@/lib/email/templates";

export type AuthActionState = {
  error?: string;
  success?: string;
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/member");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(next.startsWith("/") ? next : "/member");
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${appUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user?.email) {
    try {
      await sendEmail({
        to: data.user.email,
        subject: "Welcome to Brass Foundation",
        html: welcomeEmailHtml({
          name: fullName,
          appUrl: appUrl(),
        }),
      });
    } catch {
      // SMTP may not be configured yet — auth still succeeds
    }
  }

  return {
    success:
      "Account created. Check your email if verification is required, then sign in.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createClient();
  const redirectTo = `${appUrl()}/auth/callback?next=/login`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase also emails via its own provider for reset links.
  // Hostinger SMTP is used for custom transactional mail (welcome, notices).
  try {
    await sendEmail({
      to: email,
      subject: "Password reset requested — Brass Foundation",
      html: passwordResetEmailHtml({
        name: "",
        resetUrl: redirectTo,
      }),
    });
  } catch {
    // Ignore SMTP failures; Supabase reset email may still go out
  }

  return {
    success: "If that email exists, reset instructions have been sent.",
  };
}
