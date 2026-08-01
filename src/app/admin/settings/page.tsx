import type { Metadata } from "next";
import { isSmtpConfigured } from "@/lib/email/smtp";

export const metadata: Metadata = { title: "Admin · Settings" };

export default function AdminSettingsPage() {
  const checks = [
    {
      label: "Supabase URL",
      ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    },
    {
      label: "Supabase anon key",
      ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
    {
      label: "Service role key",
      ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    {
      label: "Hostinger SMTP",
      ok: isSmtpConfigured(),
    },
    {
      label: "App URL",
      ok: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Environment health checks. Configure values in Vercel / `.env`.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {checks.map((item) => (
          <div key={item.label} className="glass-card rounded-2xl p-5">
            <p className="font-medium">{item.label}</p>
            <p
              className={`mt-2 text-sm font-semibold ${item.ok ? "text-success" : "text-destructive"}`}
            >
              {item.ok ? "Configured" : "Missing"}
            </p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">
        Homepage copy and stats are edited in{" "}
        <a href="/admin/website" className="font-semibold text-primary">
          Website CMS
        </a>
        . Brand logo lives at <code>/public/brand/logo.png</code>.
      </div>
    </div>
  );
}
