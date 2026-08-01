import { z } from "zod";

export const membershipTypes = [
  "volunteer",
  "student",
  "general",
  "life_member",
] as const;

export const membershipTypeLabels: Record<(typeof membershipTypes)[number], string> = {
  volunteer: "Volunteer",
  student: "Student",
  general: "General",
  life_member: "Life Member",
};

export const membershipApplicationSchema = z.object({
  full_name: z.string().min(2, "Full name is required").max(120),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7, "Phone is required").max(20),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  education: z.string().min(1, "Education is required").max(200),
  occupation: z.string().min(1, "Occupation is required").max(200),
  district: z.string().min(1, "District is required").max(120),
  state: z.string().min(1, "State is required").max(120),
  address: z.string().optional(),
  interests: z.string().optional(),
  reason_for_joining: z
    .string()
    .min(20, "Please share at least a short reason (20+ characters)")
    .max(2000),
  membership_type: z.enum(membershipTypes),
});

export type MembershipApplicationInput = z.infer<
  typeof membershipApplicationSchema
>;
