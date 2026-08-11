import type { Metadata } from "next";
import { SmtpTestEmailForm } from "@/components/admin/smtp-test-email-form";
import { DailyReportEmailForm } from "@/components/admin/daily-report-email-form";
import { ShareMembershipReportForm } from "@/components/admin/share-membership-report-form";
import { getUserContext } from "@/lib/auth/session";
import { isSmtpConfigured } from "@/lib/email/smtp";
import { isRazorpayConfigured } from "@/lib/payments/razorpay";
import { isRazorpayLiveMode } from "@/lib/payments/constants";
import { getDailyReportEmail } from "@/lib/cms/site-settings";

export const metadata: Metadata = { title: "Admin · Settings" };

export default async function AdminSettingsPage() {
  const context = await getUserContext();
  const contactInbox =
    process.env.CONTACT_INBOX ||
    process.env.SMTP_FROM_EMAIL ||
    process.env.SMTP_USER;
  const smtpReady = isSmtpConfigured();
  const razorpayOk = isRazorpayConfigured();
  const razorpayLive = isRazorpayLiveMode();
  const dailyReportEmail = await getDailyReportEmail();

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
      ok: smtpReady,
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
    {
      label: "Cron secret",
      ok: Boolean(process.env.CRON_SECRET),
    },
    {
      label: "Daily report email(s)",
      ok: Boolean(dailyReportEmail),
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

      <DailyReportEmailForm defaultEmail={dailyReportEmail} />

      <ShareMembershipReportForm />

      <SmtpTestEmailForm
        smtpReady={smtpReady}
        defaultTo={context?.email || contactInbox || undefined}
      />

      <div className="glass-card space-y-3 rounded-2xl p-6 text-sm text-muted-foreground">
        <p>
          New members receive a branded welcome email (with logo) after
          successful ₹10 payment, thanking them by name and linking to the
          Membership Contribute page for monthly mandates.
        </p>
        <p>
          For production payments, set Vercel env{" "}
          <code className="text-xs">NEXT_PUBLIC_RAZORPAY_KEY_ID</code> to a{" "}
          <code className="text-xs">rzp_live_…</code> key and matching{" "}
          <code className="text-xs">RAZORPAY_KEY_SECRET</code> + webhook
          secret. Redeploy after saving.
        </p>
        <p>
          Email uses Hostinger SMTP (
          <code className="text-xs">SMTP_*</code> /{" "}
          <code className="text-xs">CONTACT_INBOX</code>). Set{" "}
          <code className="text-xs">NEXT_PUBLIC_APP_URL</code> so the logo and
          buttons use your live domain. Set{" "}
          <code className="text-xs">CRON_SECRET</code> for the midnight IST
          daily PDF report (Vercel cron: 18:30 UTC).
        </p>
      </div>
    </div>
  );
}
