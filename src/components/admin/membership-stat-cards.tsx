export function MembershipStatCards({
  primaryMembers,
  paidFamilyMembers,
  unpaidFamilyMembers,
  totalMemberships,
}: {
  primaryMembers: number;
  paidFamilyMembers: number;
  unpaidFamilyMembers: number;
  totalMemberships: number;
}) {
  const items = [
    {
      label: "Total memberships",
      value: totalMemberships,
      hint: "Primary + paid family",
    },
    {
      label: "Primary members",
      value: primaryMembers,
      hint: "Paid & approved",
    },
    {
      label: "Paid family",
      value: paidFamilyMembers,
      hint: "Paid or waived with ID",
    },
    {
      label: "Unpaid family",
      value: unpaidFamilyMembers,
      hint: "Awaiting ₹10 payment",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="glass-card rounded-xl px-4 py-3">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {item.label}
          </p>
          <p className="font-heading mt-1 text-2xl font-semibold text-primary">
            {item.value}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}
