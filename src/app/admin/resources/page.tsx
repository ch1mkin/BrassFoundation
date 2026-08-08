import type { Metadata } from "next";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { ResourceCategoryCreateForm } from "@/components/admin/resource-category-create-form";
import { ResourceCategoryThumbnailForm } from "@/components/admin/resource-category-thumbnail-form";
import { ResourceCreateForm } from "@/components/admin/resource-create-form";
import { MaterialIcon } from "@/components/ui/material-icon";
import { deleteResourceAction } from "@/lib/content/actions";
import { deleteResourceCategoryAction } from "@/lib/content/resource-category-actions";
import { getResourceCategories } from "@/lib/content/resource-categories";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Resources" };

export default async function AdminResourcesPage() {
  const supabase = await createClient();
  const [categories, resourcesResult] = await Promise.all([
    getResourceCategories(true),
    supabase
      .from("resources")
      .select(
        "id, title, category, resource_type, file_url, external_url, is_published",
      )
      .order("sort_order", { ascending: true }),
  ]);

  const { data, error } = resourcesResult;
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Resources</h1>
        <p className="mt-2 text-muted-foreground">
          Manage Digital Library categories, card thumbnails, then upload PDF or
          audio into a category. Uploading a file does not save until you click
          Create resource.
        </p>
      </div>

      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content + uploads migrations. ({error.message})
        </p>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-xl font-semibold">
            Category card thumbnails
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload images for the Digital Library cards on the homepage and
            /resources. Run migration{" "}
            <code className="text-xs">
              20260808220000_resource_category_thumbnails.sql
            </code>{" "}
            if saving fails.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <ResourceCategoryThumbnailForm key={cat.slug} category={cat} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Categories</h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <ResourceCategoryCreateForm />
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className="glass-card flex items-center justify-between gap-3 rounded-2xl p-4"
              >
                <div className="flex items-center gap-3">
                  {cat.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.thumbnail_url}
                      alt=""
                      className="size-10 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-primary">
                      <MaterialIcon name={cat.icon} />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{cat.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {cat.slug}
                      {cat.subtitle ? ` · ${cat.subtitle}` : ""}
                    </p>
                  </div>
                </div>
                {cat.id ? (
                  <AdminDeleteButton
                    id={cat.id}
                    action={deleteResourceCategoryAction}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Materials</h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <ResourceCreateForm categories={categories} />
          <div className="space-y-3">
            {(data || []).length === 0 ? (
              <p className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
                No materials yet. Upload a file, fill the title, then click
                Create resource.
              </p>
            ) : null}
            {(data || []).map((row) => {
              const cat = catBySlug[row.category];
              return (
                <div key={row.id} className="glass-card rounded-2xl p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-medium">{row.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat?.title || row.category} · {row.resource_type}
                        {row.file_url ? " · file attached" : ""}
                        {!row.is_published ? " · draft" : ""}
                      </p>
                    </div>
                    <AdminDeleteButton
                      id={row.id}
                      action={deleteResourceAction}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
