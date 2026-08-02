"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { canAccessAdmin, getUserContext } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email/smtp";
import {
  eventRegistrationEmailHtml,
  membershipReceivedEmailHtml,
} from "@/lib/email/templates";
import { ContentActionState, slugify } from "@/lib/content/utils";
import {
  getResourceCategory,
  isResourceCategorySlug,
} from "@/lib/constants";

async function requireAdmin(): Promise<
  { ok: true; userId: string } | { ok: false; error: string }
> {
  const context = await getUserContext();
  if (!context || !canAccessAdmin(context)) {
    return { ok: false, error: "Unauthorized." };
  }
  return { ok: true, userId: context.userId };
}

function boolFromForm(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

// --- Public actions ---

export async function registerForEventAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const context = await getUserContext();

  const eventId = String(formData.get("event_id") || "").trim();
  const phone = String(formData.get("phone") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  const fullName = String(formData.get("full_name") || "").trim();
  const emailRaw = String(formData.get("email") || "").trim().toLowerCase();
  const email = (emailRaw || context?.email || "").toLowerCase();
  const name =
    fullName ||
    context?.profile?.full_name ||
    context?.email ||
    "";

  if (!eventId) return { error: "Missing event." };
  if (!name) return { error: "Full name is required." };
  const emailCheck = z.string().email().safeParse(email);
  if (!emailCheck.success) {
    return { error: "A valid email is required to register." };
  }

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, title, slug, registration_open, starts_at, location")
    .eq("id", eventId)
    .eq("is_published", true)
    .maybeSingle();

  if (!event) {
    return {
      error:
        "Event not found. Run the website content SQL migration if this is a new setup.",
    };
  }

  if (!event.registration_open) {
    return { error: "Registration is closed for this event." };
  }

  const { error } = await supabase.from("event_registrations").insert({
    event_id: event.id,
    user_id: context?.userId || null,
    full_name: name,
    email: emailCheck.data,
    phone,
    notes,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You are already registered for this event." };
    }
    return { error: error.message };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await sendEmail({
    to: emailCheck.data,
    subject: `Registered — ${event.title}`,
    html: eventRegistrationEmailHtml({
      name,
      eventTitle: event.title,
      eventUrl: `${appUrl}/events/${event.slug}`,
      startsAt: event.starts_at,
      location: event.location,
    }),
  });

  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/events");
  revalidatePath("/admin/events");
  revalidatePath("/");
  return { success: "You are registered. Check your email for confirmation." };
}

export async function subscribeNewsletterAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) return { error: "Enter a valid email." };

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").upsert(
    { email: parsed.data, is_active: true },
    { onConflict: "email" },
  );

  if (error) {
    return {
      error:
        error.message.includes("newsletter_subscribers")
          ? "Newsletter is not set up yet. Run the website content SQL migration."
          : error.message,
    };
  }

  return { success: "Subscribed. Thank you for joining our updates." };
}

export async function submitContactMessageAction(input: {
  name: string;
  email: string;
  message: string;
  form_type?: string;
}): Promise<ContentActionState & { skipped?: boolean }> {
  const supabase = await createClient();
  await supabase.from("contact_messages").insert({
    name: input.name,
    email: input.email,
    message: input.message,
    form_type: input.form_type || "contact",
  });
  return { success: "Message saved." };
}

export async function notifyMembershipReceived(input: {
  name: string;
  email: string;
  applicationId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await sendEmail({
    to: input.email,
    subject: "Membership application received — Brass Foundation",
    html: membershipReceivedEmailHtml({
      name: input.name,
      appUrl,
      applicationId: input.applicationId,
    }),
  });

  const inbox = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  if (inbox) {
    await sendEmail({
      to: inbox,
      subject: `New membership application — ${input.name}`,
      html: `<p><strong>${input.name}</strong> (${input.email}) submitted a membership application.</p>
             <p>Reference: ${input.applicationId}</p>
             <p><a href="${appUrl}/admin/members">Review in admin</a></p>`,
    });
  }
}

// --- Admin CRUD ---

export async function upsertEventAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const id = String(formData.get("id") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const slug =
    String(formData.get("slug") || "").trim() || slugify(title);
  const startsAt = String(formData.get("starts_at") || "").trim();

  if (!title || !startsAt) {
    return { error: "Title and start date are required." };
  }

  const startsDate = new Date(startsAt);
  if (Number.isNaN(startsDate.getTime())) {
    return { error: "Please choose a valid start date and time." };
  }

  const payload = {
    title,
    slug,
    summary: String(formData.get("summary") || "").trim() || null,
    body: String(formData.get("body") || "").trim() || null,
    location: String(formData.get("location") || "").trim() || null,
    location_icon:
      String(formData.get("location_icon") || "").trim() || "location_on",
    starts_at: startsDate.toISOString(),
    registration_open: boolFromForm(formData, "registration_open"),
    is_published: boolFromForm(formData, "is_published"),
    is_featured: boolFromForm(formData, "is_featured"),
    tone: String(formData.get("tone") || "primary").trim() || "primary",
    cover_image_url:
      String(formData.get("cover_image_url") || "").trim() || null,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("events").update(payload).eq("id", id)
    : await supabase.from("events").insert({
        ...payload,
        created_by: auth.userId,
      });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin/events");
  if (id) revalidatePath(`/events/${slug}`);
  return { success: id ? "Event updated." : "Event created." };
}

export async function deleteEventAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing event id." };

  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin/events");
  return { success: "Event deleted." };
}

export async function upsertNewsAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const id = String(formData.get("id") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const slug =
    String(formData.get("slug") || "").trim() || slugify(title);

  if (!title) return { error: "Title is required." };

  const payload = {
    title,
    slug,
    excerpt: String(formData.get("excerpt") || "").trim() || null,
    body: String(formData.get("body") || "").trim() || null,
    category: String(formData.get("category") || "announcement").trim(),
    is_published: boolFromForm(formData, "is_published"),
    is_pinned: boolFromForm(formData, "is_pinned"),
    published_at:
      String(formData.get("published_at") || "").trim() ||
      new Date().toISOString(),
    cover_image_url:
      String(formData.get("cover_image_url") || "").trim() || null,
    created_by: auth.userId,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("news_posts").update(payload).eq("id", id)
    : await supabase.from("news_posts").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/news");
  revalidatePath("/admin/news");
  return { success: id ? "News updated." : "News created." };
}

export async function deleteNewsAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase.from("news_posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/news");
  revalidatePath("/admin/news");
  return { success: "Post deleted." };
}

export async function upsertResourceAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const id = String(formData.get("id") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const slug =
    String(formData.get("slug") || "").trim() || slugify(title);
  if (!title) return { error: "Title is required." };

  const category = String(formData.get("category") || "").trim();
  if (!isResourceCategorySlug(category)) {
    return { error: "Choose a valid library category." };
  }

  const cat = getResourceCategory(category)!;
  const resourceType = String(formData.get("resource_type") || "pdf").trim();
  const allowedTypes = new Set(["pdf", "video", "audio", "link", "other"]);
  if (!allowedTypes.has(resourceType)) {
    return { error: "Invalid resource type." };
  }

  const payload = {
    title,
    slug,
    subtitle: String(formData.get("subtitle") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    category,
    resource_type: resourceType,
    file_url: String(formData.get("file_url") || "").trim() || null,
    external_url: String(formData.get("external_url") || "").trim() || null,
    thumbnail_url: String(formData.get("thumbnail_url") || "").trim() || null,
    file_size_label:
      String(formData.get("file_size_label") || "").trim() || null,
    icon: String(formData.get("icon") || cat.icon).trim() || cat.icon,
    tone: String(formData.get("tone") || cat.tone).trim() || cat.tone,
    is_published: boolFromForm(formData, "is_published"),
    is_featured: boolFromForm(formData, "is_featured"),
    sort_order: Number(formData.get("sort_order") || 0),
    created_by: auth.userId,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("resources").update(payload).eq("id", id)
    : await supabase.from("resources").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/resources");
  revalidatePath(`/resources/${category}`);
  revalidatePath("/admin/resources");
  revalidatePath("/");
  return { success: id ? "Resource updated." : "Resource created." };
}

export async function deleteResourceAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  revalidatePath("/");
  for (const cat of [
    "constitution-of-india",
    "ambedkars-writings",
    "rights-awareness-kit",
    "leadership-podcast",
  ]) {
    revalidatePath(`/resources/${cat}`);
  }
  return { success: "Resource deleted." };
}

export async function upsertCommunityAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const id = String(formData.get("id") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const slug =
    String(formData.get("slug") || "").trim() || slugify(title);
  if (!title) return { error: "Title is required." };

  const payload = {
    title,
    slug,
    summary: String(formData.get("summary") || "").trim() || null,
    body: String(formData.get("body") || "").trim() || null,
    badge: String(formData.get("badge") || "").trim() || null,
    badge_tone: String(formData.get("badge_tone") || "primary").trim(),
    status: String(formData.get("status") || "ongoing").trim(),
    cover_image_url:
      String(formData.get("cover_image_url") || "").trim() || null,
    impact_text: String(formData.get("impact_text") || "").trim() || null,
    is_published: boolFromForm(formData, "is_published"),
    is_featured: boolFromForm(formData, "is_featured"),
    sort_order: Number(formData.get("sort_order") || 0),
    created_by: auth.userId,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("community_projects").update(payload).eq("id", id)
    : await supabase.from("community_projects").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/community");
  revalidatePath("/admin/community");
  return { success: id ? "Project updated." : "Project created." };
}

export async function deleteCommunityAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("community_projects")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/community");
  revalidatePath("/admin/community");
  return { success: "Project deleted." };
}

export async function upsertMarketplaceAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const id = String(formData.get("id") || "").trim() || null;
  const title = String(formData.get("title") || "").trim();
  const slug =
    String(formData.get("slug") || "").trim() || slugify(title);
  if (!title) return { error: "Title is required." };

  const payload = {
    title,
    slug,
    author: String(formData.get("author") || "").trim() || null,
    summary: String(formData.get("summary") || "").trim() || null,
    price_label: String(formData.get("price_label") || "Free").trim(),
    rating: Number(formData.get("rating") || 5),
    review_count: Number(formData.get("review_count") || 0),
    cover_image_url:
      String(formData.get("cover_image_url") || "").trim() || null,
    file_url: String(formData.get("file_url") || "").trim() || null,
    file_size_label:
      String(formData.get("file_size_label") || "").trim() || null,
    buy_url: String(formData.get("buy_url") || "").trim() || null,
    is_published: boolFromForm(formData, "is_published"),
    is_featured: boolFromForm(formData, "is_featured"),
    sort_order: Number(formData.get("sort_order") || 0),
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("marketplace_items").update(payload).eq("id", id)
    : await supabase.from("marketplace_items").insert(payload);

  if (error) return { error: error.message };
  revalidatePath("/marketplace");
  revalidatePath("/admin/marketplace");
  return { success: id ? "Item updated." : "Item created." };
}

export async function deleteMarketplaceAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("marketplace_items")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/marketplace");
  revalidatePath("/admin/marketplace");
  return { success: "Item deleted." };
}

export async function addGalleryMediaAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };

  const mediaUrl = String(formData.get("media_url") || "").trim();
  if (!mediaUrl) return { error: "Media URL is required." };

  const supabase = await createClient();
  const { error } = await supabase.from("gallery_media").insert({
    title: String(formData.get("title") || "").trim() || null,
    media_url: mediaUrl,
    caption: String(formData.get("caption") || "").trim() || null,
    media_type: String(formData.get("media_type") || "image").trim(),
    is_published: boolFromForm(formData, "is_published"),
    is_featured: boolFromForm(formData, "is_featured"),
  });

  if (error) return { error: error.message };
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: "Media added." };
}

export async function deleteGalleryMediaAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  const auth = await requireAdmin();
  if (!auth.ok) return { error: auth.error };
  const id = String(formData.get("id") || "").trim();
  if (!id) return { error: "Missing id." };
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_media").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { success: "Media deleted." };
}
