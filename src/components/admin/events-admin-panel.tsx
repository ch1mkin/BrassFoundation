"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminContentForm } from "@/components/admin/content-form";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { EventCalendar } from "@/components/admin/event-calendar";
import { upsertEventAction } from "@/lib/content/actions";

export type AdminEventRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  location: string | null;
  starts_at: string;
  tone: string;
  is_published: boolean;
  registration_open: boolean;
  cover_image_url: string | null;
};

function normalizeDatetimeLocal(raw: string | null) {
  if (!raw) return "";
  const cleaned = decodeURIComponent(raw).trim();
  // Full datetime-local
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(cleaned)) {
    return cleaned.slice(0, 16);
  }
  // Date-only from calendar (YYYY-MM-DD) → default 10:00 local
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return `${cleaned}T10:00`;
  }
  const parsed = new Date(cleaned);
  if (Number.isNaN(parsed.getTime())) return "";
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function toDatetimeLocal(iso: string) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function EventsAdminPanel({
  events,
  registrationCounts,
}: {
  events: AdminEventRow[];
  registrationCounts: Record<string, number>;
}) {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const dateParam = searchParams.get("date");

  const editing = useMemo(
    () => (editId ? events.find((e) => e.id === editId) || null : null),
    [editId, events],
  );

  const defaultStarts = editing
    ? toDatetimeLocal(editing.starts_at)
    : normalizeDatetimeLocal(dateParam);
  const dateLabel =
    !editing && defaultStarts ? defaultStarts.slice(0, 10) : null;

  useEffect(() => {
    if (!editId && !dateParam) return;
    const el = document.getElementById("event-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editId, dateParam]);

  return (
    <>
      <EventCalendar
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          starts_at: e.starts_at,
          slug: e.slug,
        }))}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {editing ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-primary">
                Editing: {editing.title}
              </p>
              <Link
                href="/admin/events"
                className="text-xs font-semibold text-muted-foreground hover:text-primary"
              >
                Cancel · New event
              </Link>
            </div>
          ) : dateLabel ? (
            <p className="text-sm text-muted-foreground">
              Creating event for <strong>{dateLabel}</strong> — fill the form
              below and save.
            </p>
          ) : null}

          <AdminContentForm
            formKey={
              editing?.id ||
              (defaultStarts ? `date-${defaultStarts}` : "new-event")
            }
            formId="event-form"
            resetPathOnSuccess="/admin/events"
            title={
              editing
                ? `Edit event`
                : dateLabel
                  ? `New event on ${dateLabel}`
                  : "Add event"
            }
            action={upsertEventAction}
            submitLabel={editing ? "Save changes" : "Create event"}
            hidden={editing ? { id: editing.id } : undefined}
            fields={[
              {
                name: "title",
                label: "Title",
                required: true,
                defaultValue: editing?.title || "",
              },
              {
                name: "slug",
                label: "Slug (optional)",
                defaultValue: editing?.slug || "",
              },
              {
                name: "summary",
                label: "Summary",
                type: "textarea",
                defaultValue: editing?.summary || "",
              },
              {
                name: "body",
                label: "Details",
                type: "textarea",
                defaultValue: editing?.body || "",
              },
              {
                name: "location",
                label: "Location",
                defaultValue: editing?.location || "",
              },
              {
                name: "starts_at",
                label: "Starts at",
                type: "datetime-local",
                required: true,
                defaultValue: defaultStarts,
              },
              {
                name: "tone",
                label: "Tone (primary/secondary)",
                defaultValue: editing?.tone || "primary",
              },
              {
                name: "cover_image_url",
                label: "Cover image URL (optional)",
                defaultValue: editing?.cover_image_url || "",
              },
              {
                name: "is_published",
                label: "Published (show on website)",
                type: "checkbox",
                defaultValue: editing ? editing.is_published : true,
              },
              {
                name: "registration_open",
                label: "Registration open",
                type: "checkbox",
                defaultValue: editing ? editing.registration_open : true,
              },
            ]}
          />
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">All events</h2>
          {!events.length ? (
            <p className="text-sm text-muted-foreground">
              No events yet. Click a calendar date to create one.
            </p>
          ) : null}
          {events.map((row) => (
            <div
              key={row.id}
              className={`glass-card rounded-2xl p-4 ${
                editing?.id === row.id ? "ring-2 ring-primary/40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(row.starts_at).toLocaleString("en-IN")}
                    {row.location ? ` · ${row.location}` : ""}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-primary">
                    {registrationCounts[row.id] || 0} registrations
                    {row.is_published ? " · Live" : " · Draft"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Link
                    href={`/admin/events?edit=${row.id}#event-form`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteEventButton id={row.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
