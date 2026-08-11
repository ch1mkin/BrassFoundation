# BRASS Foundation OMS — setup

## 1. Environment

Copy `.env.example` → `.env` (local) and add the same keys in Vercel → Project → Settings → Environment Variables.

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose to the browser)

### Hostinger SMTP
- `SMTP_HOST=smtp.hostinger.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER` — full mailbox address (e.g. `noreply@yourdomain.com`)
- `SMTP_PASS` — mailbox password
- `SMTP_FROM_NAME=BRASS Foundation`
- `SMTP_FROM_EMAIL` — usually same as `SMTP_USER`
- `CONTACT_INBOX` — where Contact Us + membership alerts land (e.g. `contact@yourdomain.com`; defaults to `SMTP_FROM_EMAIL`)

**Two places to configure Hostinger:**

1. **App transactional mail** (contact form, membership notices, event registration) — the env vars above (Nodemailer)
2. **Supabase Auth emails** (verify email, password reset) — Supabase Dashboard → Project Settings → Authentication → SMTP Settings → enable custom SMTP with the same Hostinger credentials

This way all email leaves through your Hostinger mailbox.

**Contact Us flow:** visitor submits name + email + message → saved to `contact_messages` → email to `CONTACT_INBOX` (reply-to = visitor) → auto-reply to visitor. Rate-limited (5 / 15 min / IP) with a honeypot field.

### App
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` locally, your Vercel URL in production

## 2. Database

1. Open Supabase → **SQL Editor**
2. Run these files in order:
   - `supabase/migrations/20260801000000_core_rbac.sql`
   - `supabase/migrations/20260801010000_homepage_cms.sql`
   - `supabase/migrations/20260801020000_membership.sql`
   - `supabase/migrations/20260801030000_profiles_role_dropdown.sql`
   - `supabase/migrations/20260801040000_website_content.sql`
   - `supabase/migrations/20260801050000_uploads_org_gallery.sql`
   - `supabase/migrations/20260801060000_blogs_stats_thumbnails.sql`
   - `supabase/migrations/20260801070000_hero_background.sql`
   - `supabase/migrations/20260801080000_i18n_payments.sql`
   - `supabase/migrations/20260801090000_fix_hero_upload.sql`
   - …later migrations through `20260802100000_secure_storage_uploads.sql` (tightens storage uploads to staff only)

This creates profiles, dynamic roles/permissions, audit logs, RLS, homepage CMS (including hero background + Punjabi fields), membership applications, payments/mandates/transactions, UI translations, a **role dropdown** on `profiles.role_id`, public content modules, **storage buckets**, gallery, org tree, blogs, and resource PDF thumbnails.

See [RAZORPAY.md](./RAZORPAY.md) for ₹10 registration + monthly contribution mandate setup.

See [ROLE_DROPDOWN.sql.md](./ROLE_DROPDOWN.sql.md) for copy-paste SQL and how to promote yourself to Super Admin.

## 3. Auth settings (Supabase Dashboard)

- Authentication → Providers → **Email**: enable
- Disable **Confirm email** so users stay signed in immediately after register
- Site URL: your Vercel URL
- Redirect URLs: `https://your-app.vercel.app/auth/callback` and `http://localhost:3000/auth/callback`

Auth is email + password only (no phone OTP).

Sessions stay signed in via long-lived auth cookies (~400 days) with automatic refresh.

## 4. First Super Admin

After signing up once via `/membership` (or an existing account):

```sql
-- Replace with your user email
insert into public.user_roles (user_id, role_id)
select p.id, r.id
from public.profiles p
cross join public.roles r
where p.email = 'you@example.com'
  and r.slug = 'super_admin'
on conflict do nothing;
```

Then open `/admin`.

## 5. Verify SMTP

```bash
curl -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"you@example.com","message":"SMTP check"}'
```
