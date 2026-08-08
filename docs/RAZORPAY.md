# Razorpay setup — Brass Foundation

Use this for **₹10 membership registration** (one-time), **family membership fees**, and **monthly contribution mandates**.

## Production (live keys)

1. Dashboard → switch to **Live Mode**
2. Generate Live API keys (`rzp_live_…`)
3. Set on Vercel (Production + Preview as needed), then redeploy:

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxx
```

Admin → Settings shows **Razorpay LIVE mode** when the public key starts with `rzp_live_`. There is no separate test-mode flag in code — the env key decides the mode.

## 1. Create / open Razorpay account

1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Complete KYC (needed for live payments)
3. Start in **Test Mode** (toggle top-left) while developing

## 2. API keys

1. Dashboard → **Account & Settings** → **API Keys**
2. Generate **Test** keys first
3. Copy into `.env` / Vercel:

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=   # set after creating webhook
```

- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is safe in the browser (Checkout)
- `RAZORPAY_KEY_SECRET` must stay **server-only**
- Never commit real secrets

## 3. Enable products you need

### A) Registration fee (₹10 one-time)

1. Dashboard → **Payment Gateway** (default Orders + Checkout)
2. No extra product required for one-time Orders
3. Our app creates an Order for **1000 paise (₹10)** after consent + signature
4. After successful Checkout, we verify the signature and **auto-approve** the member

### B) Monthly contribution mandate

1. Dashboard → **Products** → enable **Subscriptions** (Recurring Payments)
2. Ensure **eMandate / UPI Autopay / Cards** are allowed for your account (Razorpay activates these after KYC)
3. Our app creates a **Plan** + **Subscription** when the member picks ₹100 / ₹200 / ₹500 / ₹1000 / …
4. Checkout opens with `subscription_id` so the member authorises the mandate

> Note: Recurring payments often require Razorpay to activate subscriptions on your account. If create-subscription fails, contact Razorpay support and ask to enable **Subscriptions**.

## 4. Webhooks (required for mandate debits)

1. Dashboard → **Account & Settings** → **Webhooks**
2. Add URL: `https://YOUR_DOMAIN/api/payments/webhook`
3. Secret: generate and put in `RAZORPAY_WEBHOOK_SECRET`
4. Subscribe at least to:
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.halted`
   - `subscription.cancelled`
   - `payment.captured` (optional)

Local testing: use [ngrok](https://ngrok.com) or Razorpay’s webhook tester pointing at your tunnel URL.

## 5. Test cards / UPI

In **Test Mode**, use Razorpay test cards from their docs (e.g. success card `4111 1111 1111 1111`).  
For mandates, follow Razorpay’s test mandate / UPI Autopay instructions for your region.

## 6. Go live checklist

1. Switch dashboard to **Live Mode**
2. Generate **Live** API keys → update Vercel env
3. Create a **Live** webhook with the production URL
4. Confirm business name/logo on Checkout (Branding settings)
5. Run one real ₹10 registration and one small mandate in production carefully

## 7. What the app does

| Flow | Razorpay API | App tables |
|------|--------------|------------|
| Register + ₹10 | Orders + Checkout + signature verify | `membership_applications`, `payment_orders`, `transactions` |
| Monthly donate | Plans + Subscriptions + webhook | `payment_mandates`, `transactions` |

Admin: **Admin → Payments**  
Member: **Member → Payments**

## 8. SQL migration

Run in Supabase SQL Editor after previous migrations:

`supabase/migrations/20260801080000_i18n_payments.sql`
