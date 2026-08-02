import type { Metadata } from "next";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminLockedForm } from "@/components/admin/admin-locked-form";
import { CircularImageCropField } from "@/components/admin/circular-image-crop-field";
import {
  deleteExecutiveMemberAction,
  upsertExecutiveMemberFormAction,
} from "@/lib/content/committee-actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Executive Committee" };

export default async function AdminCommitteePage() {
  const supabase = await createClient();
  const { data: members, error } = await supabase
    .from("executive_committee")
    .select("id, full_name, role_title, photo_url, sort_order, is_published")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">
          Executive Committee
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage names, roles, and photos shown on the homepage and About page.
        </p>
      </div>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run <code>20260801110000_executive_committee.sql</code> in Supabase. (
          {error.message})
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="glass-card space-y-4 rounded-2xl p-6">
          <h2 className="font-heading text-lg font-semibold">Add member</h2>
          <AdminLockedForm
            action={upsertExecutiveMemberFormAction}
            submitLabel="Add member"
            className="space-y-3"
          >
            <input
              name="full_name"
              required
              placeholder="Full name"
              className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
            />
            <input
              name="role_title"
              required
              placeholder="Role title"
              className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
            />
            <input
              name="sort_order"
              type="number"
              defaultValue={(members?.length || 0) + 1}
              placeholder="Sort order"
              className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
            />
            <CircularImageCropField
              name="photo_url"
              label="Photo (circular crop)"
              bucket="avatars"
              folder="committee"
            />
          </AdminLockedForm>
        </div>

        <div className="space-y-3">
          {(members || []).map((member) => (
            <div
              key={member.id}
              className="glass-card space-y-3 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-low ring-2 ring-white">
                    {member.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photo_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        Photo
                      </span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {member.full_name}
                    </p>
                    <p className="text-xs text-primary">{member.role_title}</p>
                  </div>
                </div>
                <AdminDeleteButton
                  id={member.id}
                  action={deleteExecutiveMemberAction}
                  label="Remove"
                  pendingLabel="Removing…"
                />
              </div>

              <AdminLockedForm
                action={upsertExecutiveMemberFormAction}
                submitLabel="Save photo"
                className="space-y-2 border-t border-border/50 pt-3"
              >
                <input type="hidden" name="id" value={member.id} />
                <input type="hidden" name="full_name" value={member.full_name} />
                <input
                  type="hidden"
                  name="role_title"
                  value={member.role_title}
                />
                <input
                  type="hidden"
                  name="sort_order"
                  value={member.sort_order}
                />
                <CircularImageCropField
                  name="photo_url"
                  label="Update photo (circular crop)"
                  bucket="avatars"
                  folder="committee"
                  defaultUrl={member.photo_url || undefined}
                />
              </AdminLockedForm>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
