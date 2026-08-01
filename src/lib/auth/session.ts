import { createClient } from "@/lib/supabase/server";
import type { Role, UserSessionContext } from "@/types/database";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserContext(): Promise<UserSessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role_id, roles ( id, slug, name, description, is_system )")
    .eq("user_id", user.id);

  const roles: Role[] = (userRoles ?? [])
    .map((row) => {
      const role = row.roles as Role | Role[] | null;
      if (Array.isArray(role)) return role[0];
      return role;
    })
    .filter(Boolean) as Role[];

  const roleIds = roles.map((r) => r.id);

  let permissions: Array<{ module: string; action: string }> = [];

  if (roleIds.length > 0) {
    const { data: rolePermissions } = await supabase
      .from("role_permissions")
      .select("permissions ( module, action )")
      .in("role_id", roleIds);

    const seen = new Set<string>();
    permissions = (rolePermissions ?? [])
      .map((row) => {
        const perm = row.permissions as
          | { module: string; action: string }
          | { module: string; action: string }[]
          | null;
        if (Array.isArray(perm)) return perm[0];
        return perm;
      })
      .filter((p): p is { module: string; action: string } => Boolean(p))
      .filter((p) => {
        const key = `${p.module}:${p.action}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  return {
    userId: user.id,
    email: user.email ?? profile?.email ?? null,
    profile,
    roles,
    permissions,
  };
}

export function hasPermission(
  context: UserSessionContext | null,
  module: string,
  action: string,
) {
  if (!context) return false;
  return context.permissions.some(
    (p) => p.module === module && p.action === action,
  );
}

export function hasAnyRole(
  context: UserSessionContext | null,
  slugs: string[],
) {
  if (!context) return false;
  return context.roles.some((r) => slugs.includes(r.slug));
}

export function canAccessAdmin(context: UserSessionContext | null) {
  return hasAnyRole(context, [
    "super_admin",
    "admin",
    "secretary",
    "treasurer",
  ]);
}
