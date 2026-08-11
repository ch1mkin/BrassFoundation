"use client";

export function ReferralReportFilters({
  filters,
}: {
  filters: {
    from?: string;
    to?: string;
    gender?: string;
    age_min?: string;
    age_max?: string;
    mandates_only?: string;
  };
}) {
  return (
    <form className="grid gap-3 sm:grid-cols-3" method="get">
      <label className="space-y-1 text-xs font-medium">
        From
        <input
          type="date"
          name="from"
          defaultValue={filters.from || ""}
          className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
        />
      </label>
      <label className="space-y-1 text-xs font-medium">
        To
        <input
          type="date"
          name="to"
          defaultValue={filters.to || ""}
          className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
        />
      </label>
      <label className="space-y-1 text-xs font-medium">
        Gender
        <select
          name="gender"
          defaultValue={filters.gender || ""}
          className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
        >
          <option value="">All</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <label className="space-y-1 text-xs font-medium">
        Min age
        <input
          type="number"
          name="age_min"
          min={0}
          defaultValue={filters.age_min || ""}
          className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
        />
      </label>
      <label className="space-y-1 text-xs font-medium">
        Max age
        <input
          type="number"
          name="age_max"
          min={0}
          defaultValue={filters.age_max || ""}
          className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
        />
      </label>
      <label className="flex items-end gap-2 pb-2 text-sm">
        <input
          type="checkbox"
          name="mandates_only"
          value="1"
          defaultChecked={filters.mandates_only === "1"}
          className="size-4 rounded border-input"
        />
        Mandates only
      </label>
      <button
        type="submit"
        className="h-10 rounded-xl border border-border text-sm font-semibold sm:col-span-3"
      >
        Apply filters
      </button>
    </form>
  );
}
