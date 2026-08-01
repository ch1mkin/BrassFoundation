import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";

async function issueMembershipId() {
  const year = new Date().getFullYear();
  return `BF-${year}-${String(Date.now()).slice(-6)}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      applicationId?: string;
    };

    const orderId = body.razorpay_order_id || "";
    const paymentId = body.razorpay_payment_id || "";
    const signature = body.razorpay_signature || "";

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing payment fields." }, { status: 400 });
    }

    if (!verifyPaymentSignature({ orderId, paymentId, signature })) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const admin = createServiceClient();
    const { data: order } = await admin
      .from("payment_orders")
      .select("*")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    await admin
      .from("payment_orders")
      .update({
        status: "paid",
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    const applicationId = body.applicationId || order.application_id;

    if (order.purpose === "registration_fee" && applicationId) {
      const membershipId = await issueMembershipId();
      await admin
        .from("membership_applications")
        .update({
          status: "approved",
          payment_status: "paid",
          membership_id: membershipId,
          qr_payload: membershipId,
          approved_at: new Date().toISOString(),
          member_status: "active",
          expires_at: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .eq("id", applicationId);

      await admin.from("transactions").insert({
        user_id: user.id,
        application_id: applicationId,
        order_id: order.id,
        type: "registration",
        amount_paise: order.amount_paise,
        currency: "INR",
        razorpay_payment_id: paymentId,
        status: "captured",
        description: "Membership registration fee (₹10)",
      });

      return NextResponse.json({
        ok: true,
        membershipId,
        purpose: "registration_fee",
      });
    }

    await admin.from("transactions").insert({
      user_id: user.id,
      application_id: applicationId,
      order_id: order.id,
      type: "contribution",
      amount_paise: order.amount_paise,
      currency: "INR",
      razorpay_payment_id: paymentId,
      status: "captured",
      description: "Contribution payment",
    });

    return NextResponse.json({ ok: true, purpose: order.purpose });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verification failed." },
      { status: 500 },
    );
  }
}
