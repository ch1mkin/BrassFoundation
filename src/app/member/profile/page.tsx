import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MemberProfileForm } from "@/components/membership/member-profile-form";
import { getSessionUser, getUserContext } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit profile" };

function splitName(fullName: string | null | undefined) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] || "", surname: "" };
  }
  return {
    firstName: parts.slice(0, -1).join(" "),
    surname: parts[parts.length - 1],
  };
}

export default async function MemberProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/member/profile");

  const context = await getUserContext();
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("membership_applications")
    .select(
      "full_name, phone, address, date_of_birth, gender, category, photo_url",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const fullName =
    application?.full_name || context?.profile?.full_name || "";
  const { firstName, surname } = splitName(fullName);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Edit profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update your name, photo, and membership details. Changes save to your
          member record.
        </p>
      </div>
      <MemberProfileForm
        defaults={{
          firstName,
          surname,
          email: context?.email || user.email || "",
          phone: application?.phone || context?.profile?.phone || "",
          address: application?.address || "",
          dateOfBirth: application?.date_of_birth || "",
          gender: application?.gender || "",
          category: (application?.category || "").toUpperCase(),
          avatarUrl:
            context?.profile?.avatar_url || application?.photo_url || null,
        }}
      />
    </div>
  );
}
