import { createClient } from "@/lib/supabase/server";
import { EXECUTIVE_COMMITTEE } from "@/lib/constants";

export type ExecutiveMember = {
  id: string;
  full_name: string;
  role_title: string;
  photo_url: string | null;
  sort_order: number;
};

export async function getExecutiveCommittee(): Promise<ExecutiveMember[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("executive_committee")
      .select("id, full_name, role_title, photo_url, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return EXECUTIVE_COMMITTEE.map((m, i) => ({
        id: `fallback-${i}`,
        full_name: m.name,
        role_title: m.role,
        photo_url: null,
        sort_order: i + 1,
      }));
    }

    return data;
  } catch {
    return EXECUTIVE_COMMITTEE.map((m, i) => ({
      id: `fallback-${i}`,
      full_name: m.name,
      role_title: m.role,
      photo_url: null,
      sort_order: i + 1,
    }));
  }
}
