export default function AdminDashboardPage() {
  const cards = [
    { label: "Members", href: "/admin/members" },
    { label: "Messages", href: "/admin/messages" },
    { label: "Events", href: "/admin/events" },
    { label: "Resources", href: "/admin/resources" },
  ] as const;

  return (
    <>
      <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Manage membership, website content modules, and messages from one place.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="glass-card rounded-2xl p-6 transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="font-heading mt-2 text-xl font-semibold text-primary">
              Open →
            </p>
          </a>
        ))}
      </div>
    </>
  );
}
