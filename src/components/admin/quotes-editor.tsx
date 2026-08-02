"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadFileClient } from "@/lib/storage/client-upload";

export type EditableQuote = {
  id: string;
  quote: string;
  attribution: string;
  image_url: string;
};

function toEditable(
  initial: { quote: string; attribution?: string; image_url?: string }[],
): EditableQuote[] {
  return (initial.length
    ? initial
    : [
        {
          quote:
            "Education is the most powerful weapon which you can use to change the world.",
          attribution: "Dr. B. R. Ambedkar",
          image_url: "",
        },
      ]
  ).map((q, i) => ({
    id: `quote-${i}-${(q.quote || "").slice(0, 12)}`,
    quote: q.quote || "",
    attribution: q.attribution || "",
    image_url: q.image_url || "",
  }));
}

export function QuotesEditor({
  name = "about_quotes_json",
  initial,
}: {
  name?: string;
  initial: { quote: string; attribution?: string; image_url?: string }[];
}) {
  const [quotes, setQuotes] = useState<EditableQuote[]>(toEditable(initial));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(id: string, patch: Partial<EditableQuote>) {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  }

  function addQuote() {
    setQuotes((prev) => [
      ...prev,
      {
        id: `quote-${Date.now()}`,
        quote: "",
        attribution: "",
        image_url: "",
      },
    ]);
  }

  function removeQuote(id: string) {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }

  async function onUpload(id: string, file: File | null) {
    if (!file) return;
    setError(null);
    setPendingId(id);
    try {
      const result = await uploadFileClient("gallery", file, "quotes");
      if (!result.ok) {
        setError(result.error);
        return;
      }
      update(id, { image_url: result.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPendingId(null);
    }
  }

  const payload = quotes
    .filter((q) => q.quote.trim())
    .map(({ quote, attribution, image_url }) => ({
      quote: quote.trim(),
      attribution: attribution.trim(),
      image_url: image_url.trim(),
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-medium">
            Vision quotes & images
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Slider beside Mission & Vision. Add or remove slides — each can have
            a quote and an optional background image.
          </p>
        </div>
        <button
          type="button"
          onClick={addQuote}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
        >
          Add slide
        </button>
      </div>

      {quotes.map((q, index) => (
        <div
          key={q.id}
          className="space-y-3 rounded-2xl border border-border/50 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Slide {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeQuote(q.id)}
              className="text-xs font-semibold text-destructive"
              disabled={quotes.length <= 1}
            >
              Remove
            </button>
          </div>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">Quote</span>
            <textarea
              value={q.quote}
              onChange={(e) => update(q.id, { quote: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-input bg-white px-3 py-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">Attribution</span>
            <input
              value={q.attribution}
              onChange={(e) => update(q.id, { attribution: e.target.value })}
              placeholder="Dr. B. R. Ambedkar"
              className="h-10 w-full rounded-xl border border-input bg-white px-3"
            />
          </label>
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">
              Background image (optional)
            </span>
            <input
              value={q.image_url}
              onChange={(e) => update(q.id, { image_url: e.target.value })}
              placeholder="Paste URL or upload"
              className="h-10 w-full rounded-xl border border-input bg-white px-3 text-sm"
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="image/*"
                disabled={pendingId === q.id}
                className="max-w-full text-xs"
                onChange={(e) => {
                  void onUpload(q.id, e.target.files?.[0] || null);
                  e.target.value = "";
                }}
              />
              {pendingId === q.id ? (
                <span className="text-xs text-muted-foreground">Uploading…</span>
              ) : null}
              {q.image_url ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => update(q.id, { image_url: "" })}
                >
                  Clear image
                </Button>
              ) : null}
            </div>
            {q.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={q.image_url}
                alt=""
                className="mt-1 h-24 w-full rounded-xl object-cover"
              />
            ) : null}
          </div>
        </div>
      ))}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <input type="hidden" name={name} value={JSON.stringify(payload)} readOnly />
    </div>
  );
}
