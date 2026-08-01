export default function MemberDashboardPage() {
  return (
    <>
      <h1 className="font-heading text-3xl font-semibold">Member Dashboard</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Membership status, digital card, certificates, events, and volunteer
        hours will appear here as modules come online.
      </p>
      <div className="mt-10 max-w-md rounded-2xl bg-secondary p-6 text-secondary-foreground shadow-soft">
        <p className="text-xs tracking-wide text-white/60 uppercase">
          Membership Card Preview
        </p>
        <p className="mt-4 font-heading text-xl font-semibold">
          Digital Membership Card
        </p>
        <p className="mt-2 text-sm text-white/70">
          QR code · Membership ID · Status
        </p>
      </div>
    </>
  );
}
