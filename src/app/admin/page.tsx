export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        CMS, dynamic roles, membership approvals, analytics, and audit logs
        will be wired here once the remaining modules are connected.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Members", "Pending Approvals", "Events", "Resources"].map(
          (label) => (
            <div key={label} className="rounded-2xl bg-card p-6 shadow-soft">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 font-heading text-3xl font-semibold">—</p>
            </div>
          ),
        )}
      </div>
    </>
  );
}
