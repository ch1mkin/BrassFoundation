/** Reservation / community category options for membership + family forms. */
export const MEMBERSHIP_CATEGORIES = ["SC", "ST", "OBC", "GENERAL"] as const;

export type MembershipCategory = (typeof MEMBERSHIP_CATEGORIES)[number];

export function isMembershipCategory(value: string): value is MembershipCategory {
  return (MEMBERSHIP_CATEGORIES as readonly string[]).includes(value);
}

export const MEMBERSHIP_CATEGORY_LABELS: Record<MembershipCategory, string> = {
  SC: "SC",
  ST: "ST",
  OBC: "OBC",
  GENERAL: "General",
};
