"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminContentForm } from "@/components/admin/content-form";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { EventCalendar } from "@/components/admin/event-calendar";
import { deleteEventAction, upsertEventAction } from "@/lib/content/actions";

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

function dateToStartsAt(ymd: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "";
  return `${ymd}T10:00`;
}

function scrollToForm() {
  requestAnimationFrame(() => {
    document.getElementById("event-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

export function EventsAdminPanel({
  events,
  registrationCounts,
}: {
  events: AdminEventRow[];
  registrationCounts: Record<string, number>;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  /** Bumps form remount when user re-clicks same date/edit. */
  const [formNonce, setFormNonce] = useState(0);

  const editing = useMemo(
    () => (editId ? events.find((e) => e.id === editId) || null : null),
    [editId, events],
  );

  // If the edited event was deleted, clear edit mode
  useEffect(() => {
    if (editId && !events.some((e) => e.id === editId)) {
      setEditId(null);
    }
  }, [editId, events]);

  const defaultStarts = editing
    ? toDatetimeLocal(editing.starts_at)
    : selectedDate
      ? dateToStartsAt(selectedDate)
      : "";

  const dateLabel =
    !editing && selectedDate ? selectedDate : null;

  const onSelectDate = useCallback((ymd: string) => {
    setEditId(null);
    setSelectedDate(ymd);
    setFormNonce((n) => n + 1);
    scrollToForm();
  }, []);

  const onEditEvent = useCallback((id: string) => {
    setSelectedDate(null);
    setEditId(id);
    setFormNonce((n) => n + 1);
    scrollToForm();
  }, []);

  const clearForm = useCallback(() => {
    setEditId(null);
    setSelectedDate(null);
    setFormNonce((n) => n + 1);
  }, []);

  return (
    <>
      <EventCalendar
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          starts_at: e.starts_at,
          slug: e.slug,
        }))}
        selectedDate={selectedDate}
        editingId={editId}
        onSelectDate={onSelectDate}
        onEditEvent={onEditEvent}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {editing ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-primary">
                Editing: {editing.title}
              </p>
              <button
                type="button"
                onClick={clearForm}
                className="text-xs font-semibold text-muted-foreground hover:text-primary"
              >
                Cancel · New event
              </button>
            </div>
          ) : dateLabel ? (
            <p className="text-sm text-muted-foreground">
              Creating event for <strong>{dateLabel}</strong> — fill the form
              below and save.
            </p>
          ) : null}

          <AdminContentForm
            formKey={`${editing?.id || selectedDate || "new"}-${formNonce}`}
            formId="event-form"
            onSuccess={clearForm}
            title={
              editing
                ? "Edit event"
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
                label: "Cover image",
                type: "file-or-url",
                bucket: "gallery",
                folder: "events",
                accept: "image/*",
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
                  <button
                    type="button"
                    onClick={() => onEditEvent(row.id)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <AdminDeleteButton id={row.id} action={deleteEventAction} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
