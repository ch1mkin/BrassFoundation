import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    event?: string;
    payload?: {
      payment?: { entity?: Record<string, unknown> };
      subscription?: { entity?: Record<string, unknown> };
    };
  };

  const admin = createServiceClient();
  const type = event.event || "";

  if (type === "subscription.activated" || type === "subscription.charged") {
    const sub = event.payload?.subscription?.entity;
    const payment = event.payload?.payment?.entity;
    const subscriptionId = String(sub?.id || "");
    if (subscriptionId) {
      await admin
        .from("payment_mandates")
        .update({
          status: type === "subscription.activated" ? "active" : "active",
          updated_at: new Date().toISOString(),
          current_start: sub?.current_start
            ? new Date(Number(sub.current_start) * 1000).toISOString()
            : undefined,
          current_end: sub?.current_end
            ? new Date(Number(sub.current_end) * 1000).toISOString()
            : undefined,
        })
        .eq("razorpay_subscription_id", subscriptionId);

      if (payment?.id) {
        const { data: mandate } = await admin
          .from("payment_mandates")
          .select("id, user_id, amount_paise")
          .eq("razorpay_subscription_id", subscriptionId)
          .maybeSingle();

        if (mandate) {
          await admin.from("transactions").insert({
            user_id: mandate.user_id,
            mandate_id: mandate.id,
            type: "mandate_debit",
            amount_paise: Number(payment.amount || mandate.amount_paise),
            currency: "INR",
            razorpay_payment_id: String(payment.id),
            status: "captured",
            description: "Monthly contribution debit",
            raw_payload: payment,
          });
        }
      }
    }
  }

  if (type === "subscription.halted" || type === "subscription.cancelled") {
    const sub = event.payload?.subscription?.entity;
    const subscriptionId = String(sub?.id || "");
    if (subscriptionId) {
      await admin
        .from("payment_mandates")
        .update({
          status: type === "subscription.cancelled" ? "cancelled" : "halted",
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_subscription_id", subscriptionId);
    }
  }

  return NextResponse.json({ ok: true });
}
