import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, is_active, created_at, role_id")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: roles } = await supabase
    .from("roles")
    .select("id, name, slug");

  const roleMap = new Map((roles || []).map((r) => [r.id, r.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Users</h1>
        <p className="mt-2 text-muted-foreground">
          All registered profiles. Promote roles via SQL role dropdown or Roles
          page.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((user) => (
                <tr key={user.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium">
                    {user.full_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    {roleMap.get(user.role_id) || "member"}
                  </td>
                  <td className="px-4 py-3">
                    {user.is_active ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
