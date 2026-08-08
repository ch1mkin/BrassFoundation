import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getRazorpay,
  isRazorpayConfigured,
} from "@/lib/payments/razorpay";
import { REGISTRATION_FEE_PAISE } from "@/lib/payments/constants";
import { resolveBookPricePaise } from "@/lib/content/book-purchases";

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
      purpose?:
        | "registration_fee"
        | "contribution"
        | "book_purchase"
        | "family_registration";
      amountPaise?: number;
      marketplaceItemId?: string;
      familyMemberIds?: string[];
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
    const applicationId = body.applicationId || null;
    const marketplaceItemId = body.marketplaceItemId || null;
    const familyMemberIds = body.familyMemberIds || [];
    let bookTitle = "";

    if (purpose === "registration_fee") {
      amountPaise = REGISTRATION_FEE_PAISE;
      if (!applicationId) {
        return NextResponse.json(
          { error: "Missing application id." },
          { status: 400 },
        );
      }
    } else if (purpose === "family_registration") {
      if (!familyMemberIds.length) {
        return NextResponse.json(
          { error: "Missing family member ids." },
          { status: 400 },
        );
      }
      const adminPeek = createServiceClient();
      const { data: familyRows } = await adminPeek
        .from("family_members")
        .select("id, fee_paise, payment_status, parent_user_id")
        .in("id", familyMemberIds);

      if (!familyRows?.length) {
        return NextResponse.json(
          { error: "Family members not found." },
          { status: 404 },
        );
      }
      if (familyRows.some((r) => r.parent_user_id !== user.id)) {
        return NextResponse.json({ error: "Unauthorized family payment." }, { status: 403 });
      }
      amountPaise = familyRows
        .filter((r) => r.payment_status === "unpaid")
        .reduce((sum, r) => sum + (r.fee_paise || 0), 0);
      if (!amountPaise || amountPaise < 1000) {
        return NextResponse.json(
          { error: "No payable family members found." },
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
    } else if (purpose === "book_purchase") {
      if (!marketplaceItemId) {
        return NextResponse.json(
          { error: "Missing marketplace item id." },
          { status: 400 },
        );
      }

      const adminPeek = createServiceClient();
      const { data: item } = await adminPeek
        .from("marketplace_items")
        .select("id, title, price_paise, price_label, file_url, is_published")
        .eq("id", marketplaceItemId)
        .maybeSingle();

      if (!item || !item.is_published) {
        return NextResponse.json({ error: "Book not found." }, { status: 404 });
      }
      if (!item.file_url) {
        return NextResponse.json(
          { error: "This book is not available for purchase yet." },
          { status: 400 },
        );
      }

      const price = resolveBookPricePaise(item);
      if (!price || price < 100) {
        return NextResponse.json(
          { error: "Book price is not configured." },
          { status: 400 },
        );
      }
      amountPaise = price;
      bookTitle = item.title;

      const { data: existing } = await adminPeek
        .from("book_purchases")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("marketplace_item_id", marketplaceItemId)
        .maybeSingle();

      if (existing?.status === "approved") {
        return NextResponse.json(
          { error: "You already own this book." },
          { status: 409 },
        );
      }
      if (existing?.status === "paid_awaiting_approval") {
        return NextResponse.json(
          {
            error:
              "Payment received — awaiting owner confirmation (usually within 24 hours).",
          },
          { status: 409 },
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
        marketplace_item_id: marketplaceItemId || "",
        book_title: bookTitle,
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
        meta: marketplaceItemId
          ? { marketplace_item_id: marketplaceItemId, book_title: bookTitle }
          : familyMemberIds.length
            ? { family_member_ids: familyMemberIds }
            : {},
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

    if (purpose === "family_registration" && familyMemberIds.length) {
      await admin
        .from("family_members")
        .update({ payment_status: "pending", payment_order_id: row.id })
        .in("id", familyMemberIds);
    }

    if (purpose === "book_purchase" && marketplaceItemId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .maybeSingle();

      await admin.from("book_purchases").upsert(
        {
          user_id: user.id,
          marketplace_item_id: marketplaceItemId,
          payment_order_id: row.id,
          status: "pending_payment",
          buyer_name: profile?.full_name || null,
          buyer_email: profile?.email || user.email || null,
          buyer_phone: profile?.phone || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,marketplace_item_id" },
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentOrderId: row.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      bookTitle: bookTitle || undefined,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create order." },
      { status: 500 },
    );
  }
}
