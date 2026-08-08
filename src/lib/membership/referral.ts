import { cookies } from "next/headers";

export const REFERRAL_COOKIE = "bf_ref";

export async function captureReferralCookie(ref: string | null | undefined) {
  const value = String(ref || "").trim().toUpperCase();
  if (!/^BF-\d{4}-\d+$/i.test(value)) return;
  const jar = await cookies();
  jar.set(REFERRAL_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
}

export async function readReferralCookie(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(REFERRAL_COOKIE)?.value?.trim().toUpperCase() || "";
  return /^BF-\d{4}-\d+$/i.test(value) ? value : null;
}
