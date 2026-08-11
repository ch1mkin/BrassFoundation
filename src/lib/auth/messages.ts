/** Map Supabase / raw auth errors to calm, professional copy. */

const EXACT: Record<string, string> = {
  "Invalid login credentials":
    "We couldn't sign you in with that email and password. Please check your details and try again.",
  "Email not confirmed":
    "Please confirm your email address before signing in. Check your inbox for a verification link.",
  "User already registered":
    "An account with this email already exists. Please sign in, or reset your password if you've forgotten it.",
  "Signup requires a valid password":
    "Please choose a stronger password to create your account.",
  "Password should be at least 6 characters":
    "Your password must be at least 8 characters long.",
  "Unable to validate email address: invalid format":
    "Please enter a valid email address.",
  "Email rate limit exceeded":
    "Too many attempts. Please wait a few minutes before trying again.",
  "For security purposes, you can only request this after":
    "For security, please wait a moment before requesting another email.",
};

export function professionalAuthError(raw: string | null | undefined): string {
  const message = (raw || "").trim();
  if (!message) {
    return "Something went wrong. Please try again.";
  }

  if (EXACT[message]) return EXACT[message];

  const lower = message.toLowerCase();

  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return EXACT["Invalid login credentials"];
  }
  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    return EXACT["Email not confirmed"];
  }
  if (
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("user already exists")
  ) {
    return EXACT["User already registered"];
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Please wait a few minutes before trying again.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "We couldn't reach the server. Please check your connection and try again.";
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "The request took too long. Please try again.";
  }

  // Soften bare technical leftovers without inventing new meaning
  if (/^[A-Z][a-z]+(\s+[a-z]+)*$/.test(message) && message.length < 80) {
    return message.endsWith(".") ? message : `${message}.`;
  }

  return message.endsWith(".") ? message : `${message}.`;
}

export const AUTH_SUCCESS = {
  signedIn: "Welcome back. Redirecting you now…",
  signedUp: "Your account has been created successfully.",
  resetSent:
    "If an account exists for that email, a password reset link has been sent from BRASS Foundation. Check your inbox (and spam folder).",
  passwordUpdated:
    "Your password has been updated. You may continue to your dashboard.",
} as const;
