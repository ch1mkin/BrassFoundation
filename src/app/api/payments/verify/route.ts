import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { attachMemberToOrgTree } from "@/lib/content/attach-org-member";
import { sendMembershipWelcomeEmail } from "@/lib/email/send-membership";
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
      const { data: application } = await admin
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
        .eq("id", applicationId)
        .select("full_name, user_id, email")
        .single();

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

      const { data: profile } = await admin
        .from("profiles")
        .select("full_name, avatar_url, email")
        .eq("id", user.id)
        .maybeSingle();

      await attachMemberToOrgTree({
        userId: user.id,
        fullName:
          application?.full_name ||
          profile?.full_name ||
          user.email ||
          "Member",
        avatarUrl: profile?.avatar_url || null,
        roleTitle: "Member",
      });

      const recipient =
        application?.email ||
        profile?.email ||
        user.email ||
        "";
      const welcomeName =
        application?.full_name ||
        profile?.full_name ||
        user.email ||
        "Friend";

      const welcome = await sendMembershipWelcomeEmail({
        to: recipient,
        name: welcomeName,
        membershipId,
      });
      if (!welcome.sent) {
        console.error(
          "[payments/verify] Welcome email not sent after membership payment:",
          welcome.reason,
          { applicationId, to: recipient },
        );
      }

      revalidatePath("/admin/family");
      revalidatePath("/admin/referrals");
      revalidatePath("/member");
      revalidatePath("/");

      return NextResponse.json({
        ok: true,
        membershipId,
        purpose: "registration_fee",
        welcomeEmailSent: welcome.sent,
      });
    }

    if (order.purpose === "family_registration") {
      const meta = (order.meta || {}) as { family_member_ids?: string[] };
      const ids = meta.family_member_ids || [];
      if (!ids.length) {
        return NextResponse.json(
          { error: "Family payment meta missing." },
          { status: 400 },
        );
      }

      const year = new Date().getFullYear();
      for (const id of ids) {
        const membershipId = `BF-F-${year}-${String(Date.now()).slice(-5)}${Math.random().toString(36).slice(2, 4)}`;
        await admin
          .from("family_members")
          .update({
            payment_status: "paid",
            membership_id: membershipId,
            payment_order_id: order.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .eq("parent_user_id", user.id);
      }

      await admin.from("transactions").insert({
        user_id: user.id,
        order_id: order.id,
        type: "registration",
        amount_paise: order.amount_paise,
        currency: "INR",
        razorpay_payment_id: paymentId,
        status: "captured",
        description: "Family membership fees",
      });

      revalidatePath("/member/family");
      revalidatePath("/admin/family-members");
      revalidatePath("/");

      return NextResponse.json({
        ok: true,
        purpose: "family_registration",
      });
    }

    if (order.purpose === "book_purchase") {
      const meta = (order.meta || {}) as { marketplace_item_id?: string };
      const itemId = meta.marketplace_item_id;
      if (!itemId) {
        return NextResponse.json(
          { error: "Book purchase meta missing." },
          { status: 400 },
        );
      }

      const { data: profile } = await admin
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .maybeSingle();

      await admin.from("book_purchases").upsert(
        {
          user_id: user.id,
          marketplace_item_id: itemId,
          payment_order_id: order.id,
          status: "paid_awaiting_approval",
          paid_at: new Date().toISOString(),
          buyer_name: profile?.full_name || null,
          buyer_email: profile?.email || user.email || null,
          buyer_phone: profile?.phone || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,marketplace_item_id" },
      );

      await admin.from("transactions").insert({
        user_id: user.id,
        order_id: order.id,
        type: "contribution",
        amount_paise: order.amount_paise,
        currency: "INR",
        razorpay_payment_id: paymentId,
        status: "captured",
        description: `Featured book purchase — awaiting owner confirmation`,
      });

      revalidatePath("/admin/book-purchases");
      revalidatePath("/member/books");
      revalidatePath("/marketplace");
      revalidatePath("/");

      return NextResponse.json({
        ok: true,
        purpose: "book_purchase",
        status: "paid_awaiting_approval",
        message:
          "Payment received. Access usually within 24 hours after owner confirmation.",
      });
    }

    const contributionMeta = (order.meta || {}) as { note?: string };
    const contributionNote = String(contributionMeta.note || "").trim();
    const contributionDescription = contributionNote
      ? `One-time contribution — ${contributionNote}`
      : "Contribution payment";

    await admin.from("transactions").insert({
      user_id: user.id,
      application_id: applicationId,
      order_id: order.id,
      type: "contribution",
      amount_paise: order.amount_paise,
      currency: "INR",
      razorpay_payment_id: paymentId,
      status: "captured",
      description: contributionDescription,
    });

    revalidatePath("/member/payments");
    revalidatePath("/admin/payments");

    return NextResponse.json({ ok: true, purpose: order.purpose });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verification failed." },
      { status: 500 },
    );
  }
}
