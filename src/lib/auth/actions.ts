"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  AUTH_SUCCESS,
  professionalAuthError,
} from "@/lib/auth/messages";
import { safeNextPath } from "@/lib/security/safe-next";

export type AuthActionState = {
  error?: string;
  success?: string;
  redirectTo?: string;
};

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/member");

  if (!email || !password) {
    return { error: "Please enter both your email address and password." };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      error:
        "Sign-in is temporarily unavailable. Please try again shortly.",
    };
  }

  try {
    const supabase = await createClient();

    const result = await Promise.race([
      supabase.auth.signInWithPassword({ email, password }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              "The sign-in request took too long. Please check your connection and try again.",
            ),
          );
        }, 20_000);
      }),
    ]);

    if (result.error) {
      return { error: professionalAuthError(result.error.message) };
    }

    // Do not call redirect() here — it leaves useActionState pending stuck.
    // Cookies are set on this action response; client hard-navigates next.
    return { success: AUTH_SUCCESS.signedIn, redirectTo: safeNextPath(next) };
  } catch (err) {
    return {
      error: professionalAuthError(
        err instanceof Error
          ? err.message
          : "We couldn't complete sign-in. Please try again.",
      ),
    };
  }
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");
  const next = String(formData.get("next") || "/member");

  if (!fullName) {
    return { error: "Please enter your full name to continue." };
  }

  if (!email) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 8) {
    return {
      error: "Your password must be at least 8 characters long.",
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "The passwords you entered do not match. Please try again.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: professionalAuthError(error.message) };
  }

  if (data.session && data.user) {
    await supabase
      .from("profiles")
      .update({ full_name: fullName, email })
      .eq("id", data.user.id);
    redirect(safeNextPath(next));
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      success:
        "Your account has been created. Please sign in with your email and password to continue.",
    };
  }

  if (data.user) {
    await supabase
      .from("profiles")
      .update({ full_name: fullName, email })
      .eq("id", data.user.id);
  }

  redirect(safeNextPath(next));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Prefer client SignOutButton + hard navigation; keep this for any remaining forms.
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return { error: "Please enter the email address for your account." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/login?mode=reset`,
  });

  if (error) {
    return { error: professionalAuthError(error.message) };
  }

  return {
    success: AUTH_SUCCESS.resetSent,
  };
}

export async function updatePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  if (password.length < 8) {
    return {
      error: "Your password must be at least 8 characters long.",
    };
  }
  if (password !== confirmPassword) {
    return {
      error: "The passwords you entered do not match. Please try again.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: professionalAuthError(error.message) };

  return { success: AUTH_SUCCESS.passwordUpdated };
}
