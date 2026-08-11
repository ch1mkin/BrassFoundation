import type { Metadata } from "next";
import { PageShell } from "@/components/website/page-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Brochure" };

export default async function BrochurePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("organisation_brochures")
    .select("id, title, description, file_url, cover_image_url")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const rows = data || [];

  return (
    <PageShell
      eyebrow="About us"
      title="Organisation Brochure"
      description="Download and explore the official BRASS Foundation brochure."
    >
      {!rows.length ? (
        <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
          Brochure will appear here once uploaded from Admin → Brochure.
        </div>
      ) : (
        <div className="space-y-6">
          {rows.map((doc) => (
            <article
              key={doc.id}
              className="glass-card flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center"
            >
              {doc.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doc.cover_image_url}
                  alt=""
                  className="h-40 w-full rounded-xl object-cover sm:h-36 sm:w-28"
                />
              ) : (
                <div className="flex h-40 w-full items-center justify-center rounded-xl bg-primary/10 font-heading text-sm font-semibold text-primary sm:h-36 sm:w-28">
                  PDF
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-xl font-semibold">
                  {doc.title}
                </h2>
                {doc.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {doc.description}
                  </p>
                ) : null}
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white"
                >
                  View / Download brochure
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
