export const REGISTRATION_FEE_PAISE = 1000; // ₹10

export const CONTRIBUTION_AMOUNTS_INR = [100, 200, 500, 1000, 2000, 5000] as const;

export function formatInrFromPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}
