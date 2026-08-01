# Brass Foundation OMS — setup

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
- `SMTP_FROM_NAME=Brass Foundation`
- `SMTP_FROM_EMAIL` — usually same as `SMTP_USER`

**Two places to configure Hostinger:**

1. **App transactional mail** (contact form, welcome notices) — the env vars above (Nodemailer)
2. **Supabase Auth emails** (verify email, password reset) — Supabase Dashboard → Project Settings → Authentication → SMTP Settings → enable custom SMTP with the same Hostinger credentials

This way all email leaves through your Hostinger mailbox.

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

This creates profiles, dynamic roles/permissions, audit logs, RLS, homepage CMS, membership applications, a **role dropdown** on `profiles.role_id`, and public content modules (events, news, resources, community, gallery, marketplace, contact messages, newsletter).

See [ROLE_DROPDOWN.sql.md](./ROLE_DROPDOWN.sql.md) for copy-paste SQL and how to promote yourself to Super Admin.

## 3. Auth settings (Supabase Dashboard)

- Authentication → Providers → **Email**: enable
- Disable **Confirm email** so users stay signed in immediately after register
- Site URL: your Vercel URL
- Redirect URLs: `https://your-app.vercel.app/auth/callback` and `http://localhost:3000/auth/callback`

Auth is email + password only (no phone OTP).

Sessions stay signed in via long-lived auth cookies (~400 days) with automatic refresh.

## 4. First Super Admin

After signing up once via `/login?mode=signup`:

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
