import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getRazorpay,
  isRazorpayConfigured,
} from "@/lib/payments/razorpay";
import { REGISTRATION_FEE_PAISE } from "@/lib/payments/constants";

export async function POST(request: Request) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Razorpay is not configured yet." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      applicationId?: string;
      purpose?: "registration_fee" | "contribution";
      amountPaise?: number;
    };

    const purpose = body.purpose || "registration_fee";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    let amountPaise = body.amountPaise;
    let applicationId = body.applicationId || null;

    if (purpose === "registration_fee") {
      amountPaise = REGISTRATION_FEE_PAISE;
      if (!applicationId) {
        return NextResponse.json(
          { error: "Missing application id." },
          { status: 400 },
        );
      }
    } else if (purpose === "contribution") {
      if (!amountPaise || amountPaise < 10000) {
        return NextResponse.json(
          { error: "Minimum contribution is ₹100." },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json({ error: "Invalid purpose." }, { status: 400 });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amountPaise!,
      currency: "INR",
      receipt: `${purpose.slice(0, 8)}_${Date.now()}`.slice(0, 40),
      notes: {
        purpose,
        user_id: user.id,
        application_id: applicationId || "",
      },
    });

    const admin = createServiceClient();
    const { data: row, error } = await admin
      .from("payment_orders")
      .insert({
        user_id: user.id,
        application_id: applicationId,
        purpose,
        amount_paise: amountPaise!,
        currency: "INR",
        razorpay_order_id: order.id,
        status: "created",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (purpose === "registration_fee" && applicationId) {
      await admin
        .from("membership_applications")
        .update({ payment_status: "pending" })
        .eq("id", applicationId);
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentOrderId: row.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create order." },
      { status: 500 },
    );
  }
}
