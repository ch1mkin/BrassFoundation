import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin · Analytics" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [members, events, resources, blogs, messages, registrations] =
    await Promise.all([
      supabase
        .from("membership_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase.from("resources").select("id", { count: "exact", head: true }),
      supabase
        .from("blog_posts")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("event_registrations")
        .select("id", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "Approved members", value: members.count ?? 0 },
    { label: "Events", value: events.count ?? 0 },
    { label: "Event registrations", value: registrations.count ?? 0 },
    { label: "Resources", value: resources.count ?? 0 },
    { label: "Published blogs", value: blogs.count ?? 0 },
    { label: "Contact messages", value: messages.count ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Live counts from your BRASS Foundation database.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="glass-card rounded-2xl p-6">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="font-heading mt-2 text-3xl font-semibold text-primary">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
