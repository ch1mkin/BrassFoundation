"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import { ButtonSpinner } from "@/components/ui/inline-loader";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Watermark = {
  name?: string | null;
  email?: string | null;
  userId?: string;
  purchaseId?: string;
};

type Props = {
  bookId: string;
  title: string;
  watermark: Watermark;
};

export function ProtectedBookReader({ bookId, title, watermark }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  const label = [
    watermark.name,
    watermark.email,
    watermark.userId ? `ID ${watermark.userId}` : null,
    watermark.purchaseId ? `#${watermark.purchaseId}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/books/${bookId}/content`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Could not load book.");
        }
        const contentType = res.headers.get("content-type") || "";
        let data: ArrayBuffer;
        if (contentType.includes("application/json")) {
          const json = (await res.json()) as { url: string };
          const fileRes = await fetch(json.url);
          if (!fileRes.ok) throw new Error("Could not fetch signed PDF.");
          data = await fileRes.arrayBuffer();
        } else {
          data = await res.arrayBuffer();
        }
        if (cancelled) return;
        const doc = await pdfjs.getDocument({ data: new Uint8Array(data) })
          .promise;
        if (cancelled) return;
        setPdf(doc);
        setPageCount(doc.numPages);
        setPage(1);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load PDF.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const renderPage = useCallback(async () => {
    if (!pdf || !canvasRef.current) return;
    const pg = await pdf.getPage(page);
    const viewport = pg.getViewport({ scale: 1.35 });
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await pg.render({ canvasContext: ctx, viewport }).promise;

    // Watermark overlay on canvas
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#002B5B";
    ctx.font = "16px sans-serif";
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6);
    for (let y = -canvas.height; y < canvas.height; y += 80) {
      for (let x = -canvas.width; x < canvas.width; x += 280) {
        ctx.fillText(label || "Brass Foundation", x, y);
      }
    }
    ctx.restore();
  }, [pdf, page, label]);

  useEffect(() => {
    void renderPage();
  }, [renderPage]);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const block = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["p", "s", "P", "S"].includes(e.key)
      ) {
        e.preventDefault();
      }
      if (e.key === "PrintScreen") e.preventDefault();
    };
    const blockContext = (e: Event) => e.preventDefault();
    window.addEventListener("keydown", block);
    document.addEventListener("contextmenu", blockContext);
    return () => {
      window.removeEventListener("keydown", block);
      document.removeEventListener("contextmenu", blockContext);
    };
  }, []);

  return (
    <div
      className="select-none"
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Web reading only · personal watermark applied · screenshots are
            discouraged and may be detectable
          </p>
        </div>
        {pageCount > 0 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-muted-foreground">
              {page} / {pageCount}
            </span>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="flex min-h-[24rem] items-center justify-center gap-2 text-muted-foreground">
          <ButtonSpinner />
          Loading book…
        </div>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div
        className={cn(
          "relative mx-auto max-w-3xl overflow-hidden rounded-xl border border-border bg-white shadow-soft",
          hidden && "blur-md",
        )}
      >
        <canvas ref={canvasRef} className="mx-auto block max-w-full" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-4 py-3 text-center text-[10px] text-white/90"
          aria-hidden
        >
          Licensed to {label || "member"} · Brass Foundation
        </div>
        {hidden ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm font-medium">
            Resume reading when this tab is visible
          </div>
        ) : null}
      </div>
    </div>
  );
}
