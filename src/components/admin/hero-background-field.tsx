"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  uploadFileClient,
  type UploadBucket,
} from "@/lib/storage/client-upload";
import { persistHeroBakeAction } from "@/lib/cms/actions";
import {
  clampHeroFocus,
  clampHeroZoom,
  heroFrameStyle,
  type HeroImageFrame,
} from "@/lib/cms/hero-frame";
import { cn } from "@/lib/utils";

async function loadImageForCrop(src: string): Promise<{
  img: HTMLImageElement;
  cleanup?: () => void;
}> {
  // Prefer fetch→blob so canvas export works with Supabase public URLs.
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not load image."));
      el.src = objectUrl;
    });
    return {
      img,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    };
  } catch {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not load image."));
      el.src = src;
    });
    return { img };
  }
}

/**
 * Export the visible framed crop to match CSS object-fit:cover +
 * object-position + scale(zoom) used in the admin preview / live hero.
 */
async function exportHeroCrop(opts: {
  src: string;
  frame: HeroImageFrame;
  outW: number;
  outH: number;
}): Promise<Blob> {
  const { img, cleanup } = await loadImageForCrop(opts.src);
  try {
    const { focusX, focusY, zoom } = opts.frame;
    const outW = opts.outW;
    const outH = opts.outH;
    const srcW = img.naturalWidth;
    const srcH = img.naturalHeight;

    // Cover scale into the output box (same idea as object-fit: cover)
    const cover = Math.max(outW / srcW, outH / srcH);
    let viewW = outW / cover;
    let viewH = outH / cover;

    // object-position percentage placement
    let sx = (focusX / 100) * Math.max(0, srcW - viewW);
    let sy = (focusY / 100) * Math.max(0, srcH - viewH);

    // Zoom around the focus point (matches transform-origin + scale)
    const z = Math.max(1, zoom);
    if (z > 1) {
      const fx = sx + viewW * (focusX / 100);
      const fy = sy + viewH * (focusY / 100);
      viewW /= z;
      viewH /= z;
      sx = fx - viewW * (focusX / 100);
      sy = fy - viewH * (focusY / 100);
    }

    sx = Math.min(Math.max(0, sx), Math.max(0, srcW - viewW));
    sy = Math.min(Math.max(0, sy), Math.max(0, srcH - viewH));

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process image.");
    ctx.drawImage(img, sx, sy, viewW, viewH, 0, 0, outW, outH);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error("Could not export image."));
          else resolve(blob);
        },
        "image/jpeg",
        0.92,
      );
    });
  } finally {
    cleanup?.();
  }
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
  const router = useRouter();
  const [url, setUrl] = useState(defaultUrl || "");
  const [focusX, setFocusX] = useState(defaultFrame.focusX);
  const [focusY, setFocusY] = useState(defaultFrame.focusY);
  const [zoom, setZoom] = useState(defaultFrame.zoom);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [savingFrame, startSaveFrame] = useTransition();
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
    fx: number;
    fy: number;
  } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // Keep local state in sync after server refresh (new baked URL / frame).
  useEffect(() => {
    setUrl(defaultUrl || "");
  }, [defaultUrl]);

  useEffect(() => {
    setFocusX(defaultFrame.focusX);
    setFocusY(defaultFrame.focusY);
    setZoom(defaultFrame.zoom);
  }, [defaultFrame.focusX, defaultFrame.focusY, defaultFrame.zoom]);

  const frame: HeroImageFrame = { focusX, focusY, zoom };
  const isMobile = variant === "mobile";
  const previewSrc = (url || previewFallbackUrl || "").trim();
  const busy = pending || savingFrame;

  function updateUrl(next: string) {
    setUrl(next);
    onUrlChange?.(next);
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    setSuccess(null);
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

  function persistFrameToLiveSite(nextUrl: string, nextFrame: HeroImageFrame) {
    return new Promise<boolean>((resolve) => {
      startSaveFrame(async () => {
        const result = await persistHeroBakeAction({
          variant,
          url: nextUrl,
          focusX: nextFrame.focusX,
          focusY: nextFrame.focusY,
          zoom: nextFrame.zoom,
        });
        if (result.error) {
          setError(result.error);
          setSuccess(null);
          resolve(false);
          return;
        }
        setSuccess(
          result.success || "Hero framing published to the live site.",
        );
        setError(null);
        router.refresh();
        resolve(true);
      });
    });
  }

  async function bakeCrop() {
    if (!previewSrc) return;
    setPending(true);
    setError(null);
    setSuccess(null);
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

      const bakedFrame: HeroImageFrame = {
        focusX: 50,
        focusY: 50,
        zoom: 1,
      };
      updateUrl(result.url);
      setFocusX(bakedFrame.focusX);
      setFocusY(bakedFrame.focusY);
      setZoom(bakedFrame.zoom);

      const ok = await persistFrameToLiveSite(result.url, bakedFrame);
      if (!ok) {
        setSuccess(
          "Crop uploaded. Click “Save homepage” to publish if auto-save failed.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not crop. Try re-uploading the image, then bake again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function saveFramingOnly() {
    const liveUrl = url.trim();
    if (!liveUrl) {
      setError(
        isMobile
          ? "Set a mobile hero image (or bake from the desktop preview) before saving framing."
          : "Upload or paste a hero image before saving framing.",
      );
      return;
    }
    setError(null);
    setSuccess(null);
    await persistFrameToLiveSite(liveUrl, frame);
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
          disabled={busy}
          className="max-w-full text-xs"
          onChange={(e) => {
            void onFile(e.target.files?.[0] || null);
            e.target.value = "";
          }}
        />
        {busy ? (
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
              setSuccess(null);
            }}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {previewSrc ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Drag to reposition · zoom to crop in · <strong>Bake crop</strong>{" "}
            exports and publishes the framed image to the live hero
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
              disabled={busy}
              onClick={() => void bakeCrop()}
            >
              Bake crop
            </Button>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-lg"
            disabled={busy || !url.trim()}
            onClick={() => void saveFramingOnly()}
          >
            {savingFrame ? "Publishing framing…" : "Publish framing (no bake)"}
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-xs font-medium text-success" role="status">
          {success}
        </p>
      ) : null}
    </div>
  );
}
