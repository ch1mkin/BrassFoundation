import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Messages" };

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, form_type, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Messages</h1>
        <p className="mt-2 text-muted-foreground">
          Contact form submissions from the public website.
        </p>
      </div>
      {error ? (
        <p className="glass-card rounded-2xl p-6 text-sm text-destructive">
          Run website content migration. ({error.message})
        </p>
      ) : !data?.length ? (
        <p className="glass-card rounded-2xl p-6 text-muted-foreground">
          No messages yet.
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((row) => (
            <article key={row.id} className="glass-card rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString("en-IN")}
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{row.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
