import type { Metadata } from "next";
import { InstantImg } from "@/components/website/instant-img";
import { PageShell } from "@/components/website/page-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Achievers" };

export default async function AchieversPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("achievers")
    .select("id, full_name, age, photo_url, achievement")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const rows = data || [];

  return (
    <PageShell
      eyebrow="Celebrate"
      title="Our Achievers"
      description="Recognising excellence, leadership, and inspiration within the BRASS Foundation family."
      wide
    >
      {!rows.length ? (
        <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
          Achievers will appear here once published by the admin team.
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((person) => (
            <article
              key={person.id}
              className="group flex flex-col items-center rounded-3xl bg-gradient-to-b from-white to-surface-low p-6 text-center shadow-soft ring-1 ring-border/60"
            >
              <div className="relative mb-4">
                <span
                  aria-hidden
                  className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 text-2xl drop-shadow-[0_2px_6px_rgba(242,178,51,0.8)]"
                >
                  👑
                </span>
                <div className="size-32 overflow-hidden rounded-full bg-primary/10 ring-4 ring-gold/70 shadow-[0_0_24px_rgba(242,178,51,0.35)]">
                  {person.photo_url ? (
                    <InstantImg
                      src={person.photo_url}
                      alt={person.full_name}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center font-heading text-3xl font-semibold text-primary">
                      {person.full_name.slice(0, 1)}
                    </div>
                  )}
                </div>
              </div>
              <h2 className="font-heading text-xl font-semibold">
                {person.full_name}
              </h2>
              {person.age != null ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Age {person.age}
                </p>
              ) : null}
              {person.achievement ? (
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                  {person.achievement}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
