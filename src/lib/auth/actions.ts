"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: string;
  redirectTo?: string;
};

function safeNext(next: string) {
  if (!next.startsWith("/") || next.startsWith("//")) return "/member";
  return next;
}

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
    return { error: "Email and password are required." };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return { error: "Authentication is not configured." };
  }

  try {
    const supabase = await createClient();

    const result = await Promise.race([
      supabase.auth.signInWithPassword({ email, password }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              "Sign-in timed out. Check your connection and try again.",
            ),
          );
        }, 20_000);
      }),
    ]);

    if (result.error) {
      return { error: result.error.message };
    }

    // Do not call redirect() here — it leaves useActionState pending stuck.
    // Cookies are set on this action response; client hard-navigates next.
    return { success: "Signed in", redirectTo: safeNext(next) };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Sign-in failed. Please try again.",
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
    return { error: "Full name is required." };
  }

  if (!email) {
    return { error: "Email is required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
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
    return { error: error.message };
  }

  if (data.session && data.user) {
    await supabase
      .from("profiles")
      .update({ full_name: fullName, email })
      .eq("id", data.user.id);
    redirect(safeNext(next));
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return {
      error:
        signInError.message ||
        "Account created. Please sign in with your email and password.",
    };
  }

  if (data.user) {
    await supabase
      .from("profiles")
      .update({ full_name: fullName, email })
      .eq("id", data.user.id);
  }

  redirect(safeNext(next));
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
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return { error: "Email is required." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/login?mode=reset`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "If an account exists for that email, a reset link has been sent.",
  };
}

export async function updatePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { success: "Password updated. You can continue to your dashboard." };
}
