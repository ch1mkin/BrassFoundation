export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        CMS, membership approvals, analytics, and audit logs — start with
        Members or Website CMS.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Members", "Pending Approvals", "Events", "Resources"].map(
          (label) => (
            <div key={label} className="glass-card rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="font-heading mt-2 text-3xl font-semibold">—</p>
            </div>
          ),
        )}
      </div>
    </>
  );
}
