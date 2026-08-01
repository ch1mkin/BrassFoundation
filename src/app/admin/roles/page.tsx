import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Roles" };

export default async function AdminRolesPage() {
  const supabase = await createClient();
  const { data: roles, error } = await supabase
    .from("roles")
    .select("id, slug, name, description, is_system")
    .order("name");

  const { data: permissions } = await supabase
    .from("permissions")
    .select("id, module, action")
    .order("module");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Roles</h1>
        <p className="mt-2 text-muted-foreground">
          System roles and permission matrix. Assign via profiles.role_id in
          Supabase Table Editor.
        </p>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(roles || []).map((role) => (
            <div key={role.id} className="glass-card rounded-2xl p-5">
              <p className="font-heading text-lg font-semibold">{role.name}</p>
              <p className="text-xs text-muted-foreground">{role.slug}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {role.description || "No description"}
              </p>
              {role.is_system ? (
                <p className="mt-2 text-xs font-semibold text-primary">
                  System role
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <div>
        <h2 className="font-heading mb-3 text-xl font-semibold">
          Permissions ({permissions?.length || 0})
        </h2>
        <div className="flex flex-wrap gap-2">
          {(permissions || []).map((p) => (
            <span
              key={p.id}
              className="rounded-full bg-surface-high px-3 py-1 text-xs font-medium"
            >
              {p.module}.{p.action}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
