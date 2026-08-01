export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "publish"
  | "approve"
  | "reject"
  | "export"
  | "manage_settings"
  | "assign_roles";

export type PermissionModule =
  | "members"
  | "users"
  | "roles"
  | "website"
  | "gallery"
  | "marketplace"
  | "resources"
  | "events"
  | "news"
  | "community"
  | "analytics"
  | "audit"
  | "settings";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Role = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_system: boolean;
};

export type Permission = {
  id: string;
  module: PermissionModule | string;
  action: PermissionAction | string;
  description: string | null;
};

export type UserSessionContext = {
  userId: string;
  email: string | null;
  profile: Profile | null;
  roles: Role[];
  permissions: Array<{ module: string; action: string }>;
};
