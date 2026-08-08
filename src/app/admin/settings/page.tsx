import type { Metadata } from "next";
import { isSmtpConfigured } from "@/lib/email/smtp";
import { isRazorpayConfigured } from "@/lib/payments/razorpay";
import { isRazorpayLiveMode } from "@/lib/payments/constants";

export const metadata: Metadata = { title: "Admin · Settings" };

export default function AdminSettingsPage() {
  const contactInbox =
    process.env.CONTACT_INBOX ||
    process.env.SMTP_FROM_EMAIL ||
    process.env.SMTP_USER;
  const razorpayOk = isRazorpayConfigured();
  const razorpayLive = isRazorpayLiveMode();

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
      label: "Contact inbox",
      ok: Boolean(contactInbox),
    },
    {
      label: "Razorpay keys",
      ok: razorpayOk,
    },
    {
      label: "Razorpay LIVE mode",
      ok: razorpayLive,
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
              {item.ok ? "Configured" : "Missing / Test mode"}
            </p>
          </div>
        ))}
      </div>
      <div className="glass-card space-y-3 rounded-2xl p-6 text-sm text-muted-foreground">
        <p>
          For production payments, set Vercel env{" "}
          <code className="text-xs">NEXT_PUBLIC_RAZORPAY_KEY_ID</code> to a{" "}
          <code className="text-xs">rzp_live_…</code> key and matching{" "}
          <code className="text-xs">RAZORPAY_KEY_SECRET</code> + webhook secret.
          Redeploy after saving.
        </p>
        <p>
          Contact Us mail uses Hostinger SMTP (
          <code className="text-xs">SMTP_*</code> /{" "}
          <code className="text-xs">CONTACT_INBOX</code>).
        </p>
      </div>
    </div>
  );
}
