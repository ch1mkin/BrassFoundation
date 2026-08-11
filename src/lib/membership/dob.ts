/** Date-of-birth helpers (ISO `YYYY-MM-DD`). */

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function toIsoDate(year: number, month: number, day: number): string | null {
  if (!year || !month || !day) return null;
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseIsoDate(iso: string): {
  year: number;
  month: number;
  day: number;
} | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!toIsoDate(year, month, day)) return null;
  return { year, month, day };
}

export function ageFromIsoDate(iso: string, today = new Date()): number | null {
  const parsed = parseIsoDate(iso);
  if (!parsed) return null;
  const { year, month, day } = parsed;
  let age = today.getFullYear() - year;
  const mid = today.getMonth() + 1;
  const did = today.getDate();
  if (mid < month || (mid === month && did < day)) age -= 1;
  return age;
}

export function dobError(
  iso: string,
  opts?: { minAge?: number; maxAge?: number },
): string | null {
  if (!iso.trim()) return "Date of birth is required.";
  const age = ageFromIsoDate(iso);
  if (age === null) return "Enter a valid date of birth.";
  if (age < 0) return "Date of birth cannot be in the future.";
  const minAge = opts?.minAge ?? 0;
  const maxAge = opts?.maxAge ?? 119;
  if (age < minAge) return `Minimum age is ${minAge}.`;
  if (age > maxAge) return `Enter a realistic date of birth (max age ${maxAge}).`;
  return null;
}

export const DOB_MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
] as const;

export function dobYearOptions(maxAge = 119) {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= current - maxAge; y -= 1) years.push(y);
  return years;
}
