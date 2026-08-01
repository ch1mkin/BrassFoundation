import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getRazorpay,
  isRazorpayConfigured,
} from "@/lib/payments/razorpay";

/** Create or reuse a monthly Razorpay plan + subscription (e-mandate). */
export async function POST(request: Request) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Razorpay is not configured yet." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { amountInr?: number };
    const amountInr = Number(body.amountInr || 0);
    if (![100, 200, 500, 1000, 2000, 5000].includes(amountInr)) {
      return NextResponse.json(
        { error: "Choose 100, 200, 500, 1000, 2000 or 5000." },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in as a member." }, { status: 401 });
    }

    const amountPaise = amountInr * 100;
    const razorpay = getRazorpay();
    const admin = createServiceClient();

    const plan = await razorpay.plans.create({
      period: "monthly",
      interval: 1,
      item: {
        name: `Brass Foundation monthly ₹${amountInr}`,
        amount: amountPaise,
        currency: "INR",
        description: `Monthly contribution of ₹${amountInr}`,
      },
    });

    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.id,
      total_count: 120,
      customer_notify: 1,
      notes: {
        user_id: user.id,
        amount_inr: String(amountInr),
      },
    });

    const { data: mandate, error } = await admin
      .from("payment_mandates")
      .insert({
        user_id: user.id,
        amount_paise: amountPaise,
        currency: "INR",
        razorpay_plan_id: plan.id,
        razorpay_subscription_id: subscription.id,
        status: subscription.status || "created",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      mandateId: mandate.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amountInr,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not start subscription.",
      },
      { status: 500 },
    );
  }
}
