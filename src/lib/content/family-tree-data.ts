import { createServiceClient } from "@/lib/supabase/admin";

export type FamilyTreePerson = {
  id: string;
  parentId: string | null;
  name: string;
  role: string;
  avatarUrl: string | null;
  kind: "org" | "member" | "referral";
  /** Household members linked to this person (not shown as tree nodes). */
  familyCount: number;
};

const ROOT_ID = "brass-root";

export async function loadFamilyTreePeople(): Promise<FamilyTreePerson[]> {
  let admin;
  try {
    admin = createServiceClient();
  } catch {
    return [];
  }

  const [orgRes, membersRes, familyRes, profilesRes] = await Promise.all([
    admin
      .from("org_nodes")
      .select(
        "id, parent_id, full_name, role_title, avatar_url, sort_order, profile_id",
      )
      .order("sort_order", { ascending: true }),
    admin
      .from("membership_applications")
      .select(
        "id, user_id, full_name, membership_id, membership_type, status, photo_url, referred_by_membership_id",
      )
      .order("created_at", { ascending: true }),
    admin
      .from("family_members")
      .select("id, parent_user_id, parent_membership_id")
      .order("created_at", { ascending: true }),
    admin.from("profiles").select("id, full_name, avatar_url"),
  ]);

  const people: FamilyTreePerson[] = [];
  const ids = new Set<string>();

  function add(person: FamilyTreePerson) {
    if (ids.has(person.id)) return;
    ids.add(person.id);
    people.push(person);
  }

  const orgNodes = orgRes.data || [];
  const orgRoot = orgNodes.find((n) => !n.parent_id);
  const attachRootId = orgRoot?.id || ROOT_ID;

  if (!orgRoot) {
    add({
      id: ROOT_ID,
      parentId: null,
      name: "BRASS Foundation",
      role: "Organization",
      avatarUrl: "/brand/logo.png",
      kind: "org",
      familyCount: 0,
    });
  }

  const orgIdByProfile = new Map<string, string>();
  for (const node of orgNodes) {
    if (node.profile_id) orgIdByProfile.set(node.profile_id, node.id);
    add({
      id: node.id,
      parentId:
        node.parent_id || (orgRoot && node.id === orgRoot.id ? null : attachRootId),
      name: node.full_name,
      role: node.role_title,
      avatarUrl: node.avatar_url,
      kind: "org",
      familyCount: 0,
    });
  }

  const profileById = new Map((profilesRes.data || []).map((p) => [p.id, p]));
  const memberNodeByUser = new Map<string, string>(orgIdByProfile);
  const memberNodeByMembership = new Map<string, string>();

  for (const app of membersRes.data || []) {
    if (app.user_id && orgIdByProfile.has(app.user_id)) {
      const orgId = orgIdByProfile.get(app.user_id)!;
      if (app.membership_id) memberNodeByMembership.set(app.membership_id, orgId);
      continue;
    }

    const id = `member-${app.id}`;
    const profile = app.user_id ? profileById.get(app.user_id) : null;
    const referrerId = app.referred_by_membership_id?.trim() || null;
    const referrerNode = referrerId
      ? memberNodeByMembership.get(referrerId)
      : undefined;
    const isReferral = Boolean(referrerNode && referrerNode !== id);

    add({
      id,
      parentId: isReferral ? referrerNode! : attachRootId,
      name: app.full_name || profile?.full_name || "Member",
      role: isReferral
        ? app.membership_id
          ? `Referral · ${app.membership_id}`
          : "Referral member"
        : app.status === "approved"
          ? app.membership_id || "Member"
          : `${app.status || "pending"} application`,
      avatarUrl: profile?.avatar_url || app.photo_url || null,
      kind: isReferral ? "referral" : "member",
      familyCount: 0,
    });
    if (app.user_id) memberNodeByUser.set(app.user_id, id);
    if (app.membership_id) memberNodeByMembership.set(app.membership_id, id);
  }

  const familyCountByNode = new Map<string, number>();
  for (const fam of familyRes.data || []) {
    const nodeId =
      (fam.parent_user_id && memberNodeByUser.get(fam.parent_user_id)) ||
      (fam.parent_membership_id &&
        memberNodeByMembership.get(fam.parent_membership_id));
    if (!nodeId) continue;
    familyCountByNode.set(nodeId, (familyCountByNode.get(nodeId) || 0) + 1);
  }

  for (const person of people) {
    const count = familyCountByNode.get(person.id) || 0;
    if (count > 0) person.familyCount = count;
  }

  return people;
}
