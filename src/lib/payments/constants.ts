export const REGISTRATION_FEE_PAISE = 1000; // ₹10
export const FAMILY_MEMBER_FEE_PAISE = 1000; // ₹10 per adult family member
export const FAMILY_MINOR_AGE = 18;

export const CONTRIBUTION_AMOUNTS_INR = [100, 200, 500, 1000, 2000, 5000] as const;

export function formatInrFromPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function isRazorpayLiveMode() {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  return key.startsWith("rzp_live_");
}
