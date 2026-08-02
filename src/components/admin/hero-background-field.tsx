"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  uploadFileClient,
  type UploadBucket,
} from "@/lib/storage/client-upload";
import {
  clampHeroFocus,
  clampHeroZoom,
  heroFrameStyle,
  type HeroImageFrame,
} from "@/lib/cms/hero-frame";
import { cn } from "@/lib/utils";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = src;
  });
}

/** Export the visible framed crop (object-cover + focus + zoom) as a JPEG blob. */
async function exportHeroCrop(opts: {
  src: string;
  frame: HeroImageFrame;
  outW: number;
  outH: number;
}): Promise<Blob> {
  const img = await loadImage(opts.src);
  const { focusX, focusY, zoom } = opts.frame;
  const outW = opts.outW;
  const outH = opts.outH;
  const targetRatio = outW / outH;

  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;
  const srcRatio = srcW / srcH;

  // Base cover crop (same as object-fit: cover)
  let cropW: number;
  let cropH: number;
  if (srcRatio > targetRatio) {
    cropH = srcH;
    cropW = srcH * targetRatio;
  } else {
    cropW = srcW;
    cropH = srcW / targetRatio;
  }

  // Zoom in = smaller crop window
  cropW /= zoom;
  cropH /= zoom;

  // Focus maps 0–100 to crop placement within remaining slack
  const maxX = Math.max(0, srcW - cropW);
  const maxY = Math.max(0, srcH - cropH);
  const sx = maxX * (focusX / 100);
  const sy = maxY * (focusY / 100);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");
  ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, outW, outH);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not export image."));
        else resolve(blob);
      },
      "image/jpeg",
      0.92,
    );
  });
}

export function HeroBackgroundField({
  urlName,
  focusXName,
  focusYName,
  zoomName,
  label,
  hint,
  bucket,
  folder,
  variant,
  defaultUrl,
  defaultFrame,
  previewFallbackUrl,
  onUrlChange,
}: {
  urlName: string;
  focusXName: string;
  focusYName: string;
  zoomName: string;
  label: string;
  hint?: string;
  bucket: UploadBucket;
  folder?: string;
  variant: "desktop" | "mobile";
  defaultUrl?: string;
  defaultFrame: HeroImageFrame;
  /** When URL is empty, still preview framing against this image (e.g. desktop hero). */
  previewFallbackUrl?: string;
  onUrlChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultUrl || "");
  const [focusX, setFocusX] = useState(defaultFrame.focusX);
  const [focusY, setFocusY] = useState(defaultFrame.focusY);
  const [zoom, setZoom] = useState(defaultFrame.zoom);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
    fx: number;
    fy: number;
  } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const frame: HeroImageFrame = { focusX, focusY, zoom };
  const isMobile = variant === "mobile";
  const previewSrc = (url || previewFallbackUrl || "").trim();

  function updateUrl(next: string) {
    setUrl(next);
    onUrlChange?.(next);
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    setPending(true);
    try {
      const result = await uploadFileClient(bucket, file, folder);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      updateUrl(result.url);
      setFocusX(50);
      setFocusY(50);
      setZoom(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(false);
    }
  }

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!previewSrc) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        fx: focusX,
        fy: focusY,
      };
    },
    [previewSrc, focusX, focusY],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !dragStart.current || !frameRef.current) return;
      const rect = frameRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
      const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
      // Drag image with finger: move right → lower focus X
      setFocusX(clampHeroFocus(dragStart.current.fx - dx));
      setFocusY(clampHeroFocus(dragStart.current.fy - dy));
    },
    [dragging],
  );

  const endDrag = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const up = () => endDrag();
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragging, endDrag]);

  async function bakeCrop() {
    if (!previewSrc) return;
    setPending(true);
    setError(null);
    try {
      const outW = isMobile ? 1080 : 1920;
      const outH = isMobile ? 1920 : 1080;
      const blob = await exportHeroCrop({
        src: previewSrc,
        frame,
        outW,
        outH,
      });
      const file = new File(
        [blob],
        `hero-${variant}-${Date.now()}.jpg`,
        { type: "image/jpeg" },
      );
      const result = await uploadFileClient(bucket, file, folder);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      updateUrl(result.url);
      setFocusX(50);
      setFocusY(50);
      setZoom(1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not crop. Try a same-origin uploaded image.",
      );
    } finally {
      setPending(false);
    }
  }

  function resetFrame() {
    setFocusX(50);
    setFocusY(50);
    setZoom(1);
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-surface-low/60 p-4">
      <div>
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>

      <Input
        name={urlName}
        value={url}
        onChange={(e) => updateUrl(e.target.value)}
        placeholder="Paste URL or upload a file"
        className="h-10 rounded-xl bg-white"
      />
      <input type="hidden" name={focusXName} value={focusX} />
      <input type="hidden" name={focusYName} value={focusY} />
      <input type="hidden" name={zoomName} value={zoom} />

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={pending}
          className="max-w-full text-xs"
          onChange={(e) => {
            void onFile(e.target.files?.[0] || null);
            e.target.value = "";
          }}
        />
        {pending ? (
          <span className="text-xs text-muted-foreground">Working…</span>
        ) : null}
        {url ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => {
              updateUrl("");
              resetFrame();
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {previewSrc ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Drag to reposition · use zoom to crop in · bake crop to save a new
            image file
            {!url && previewFallbackUrl
              ? " · previewing desktop image for mobile framing"
              : ""}
          </p>
          <div
            className={cn(
              "mx-auto w-full overflow-hidden rounded-xl border border-border bg-black/80 shadow-inner",
              isMobile ? "max-w-[220px] aspect-[9/16]" : "aspect-video",
            )}
          >
            <div
              ref={frameRef}
              className={cn(
                "relative h-full w-full touch-none select-none overflow-hidden",
                dragging ? "cursor-grabbing" : "cursor-grab",
              )}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt=""
                draggable={false}
                className="pointer-events-none h-full w-full object-cover"
                style={heroFrameStyle(frame)}
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/25" />
              <div
                className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand/80 shadow"
                style={{ left: `${focusX}%`, top: `${focusY}%` }}
              />
            </div>
          </div>

          <label className="block space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Zoom / crop</span>
              <span className="tabular-nums">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(clampHeroZoom(e.target.value))}
              className="w-full accent-primary"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">Focus X %</span>
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={Math.round(focusX)}
                onChange={(e) => setFocusX(clampHeroFocus(e.target.value))}
                className="h-9 rounded-lg bg-white"
              />
            </label>
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">Focus Y %</span>
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={Math.round(focusY)}
                onChange={(e) => setFocusY(clampHeroFocus(e.target.value))}
                className="h-9 rounded-lg bg-white"
              />
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 self-end rounded-lg"
              onClick={resetFrame}
            >
              Reset frame
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 self-end rounded-lg"
              disabled={pending}
              onClick={() => void bakeCrop()}
            >
              Bake crop
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
