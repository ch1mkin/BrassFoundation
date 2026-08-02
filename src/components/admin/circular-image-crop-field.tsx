"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  uploadFileClient,
  type UploadBucket,
} from "@/lib/storage/client-upload";
import { cn } from "@/lib/utils";

const OUTPUT_SIZE = 512;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = src;
  });
}

async function exportCircularCrop(opts: {
  src: string;
  offsetX: number;
  offsetY: number;
  scale: number;
  frameSize: number;
}): Promise<Blob> {
  const img = await loadImage(opts.src);
  const { frameSize, offsetX, offsetY, scale } = opts;
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  const left = frameSize / 2 + offsetX - drawW / 2;
  const top = frameSize / 2 + offsetY - drawH / 2;

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");

  const ratio = OUTPUT_SIZE / frameSize;
  ctx.save();
  ctx.beginPath();
  ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  ctx.drawImage(img, left * ratio, top * ratio, drawW * ratio, drawH * ratio);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not export image."));
        else resolve(blob);
      },
      "image/png",
      0.92,
    );
  });
}

export function CircularImageCropField({
  name,
  label,
  bucket,
  folder,
  defaultUrl,
}: {
  name: string;
  label: string;
  bucket: UploadBucket;
  folder?: string;
  defaultUrl?: string;
}) {
  const [url, setUrl] = useState(defaultUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameSize, setFrameSize] = useState(280);

  useEffect(() => {
    if (!frameRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setFrameSize(w);
    });
    ro.observe(frameRef.current);
    return () => ro.disconnect();
  }, [cropSrc]);

  useEffect(() => {
    return () => {
      if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    };
  }, [cropSrc]);

  const openCrop = useCallback(async (file: File) => {
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await loadImage(objectUrl);
      const frame = 280;
      const cover = Math.max(frame / img.naturalWidth, frame / img.naturalHeight);
      setBaseScale(cover);
      setScale(cover);
      setOffset({ x: 0, y: 0 });
      setCropSrc(objectUrl);
    } catch {
      URL.revokeObjectURL(objectUrl);
      setError("Could not read that image.");
    }
  }, []);

  async function confirmCrop() {
    if (!cropSrc) return;
    setPending(true);
    setError(null);
    try {
      const blob = await exportCircularCrop({
        src: cropSrc,
        offsetX: offset.x,
        offsetY: offset.y,
        scale,
        frameSize,
      });
      const file = new File([blob], `committee-${Date.now()}.png`, {
        type: "image/png",
      });
      const result = await uploadFileClient(bucket, file, folder);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setUrl(result.url);
      if (cropSrc.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Crop failed.");
    } finally {
      setPending(false);
    }
  }

  function cancelCrop() {
    if (cropSrc?.startsWith("blob:")) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <Input
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste URL or upload & crop a photo"
        className="h-10 rounded-xl bg-white"
      />

      {!cropSrc ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={pending}
            className="max-w-full text-xs"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              e.target.value = "";
              if (file) void openCrop(file);
            }}
          />
          {url ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => setUrl("")}
            >
              Clear
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-border bg-surface-low p-3">
          <p className="text-xs text-muted-foreground">
            Drag to reposition · use the slider to zoom · preview matches the
            circular executive profile
          </p>
          <div
            ref={frameRef}
            className="relative mx-auto aspect-square w-full max-w-[280px] touch-none overflow-hidden rounded-full bg-white shadow-inner ring-2 ring-primary/30"
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              setDragging(true);
              dragStart.current = {
                x: e.clientX,
                y: e.clientY,
                ox: offset.x,
                oy: offset.y,
              };
            }}
            onPointerMove={(e) => {
              if (!dragging || !dragStart.current) return;
              setOffset({
                x: dragStart.current.ox + (e.clientX - dragStart.current.x),
                y: dragStart.current.oy + (e.clientY - dragStart.current.y),
              });
            }}
            onPointerUp={() => {
              setDragging(false);
              dragStart.current = null;
            }}
            onPointerCancel={() => {
              setDragging(false);
              dragStart.current = null;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cropSrc}
              alt=""
              draggable={false}
              className={cn(
                "pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none",
                dragging ? "cursor-grabbing" : "cursor-grab",
              )}
              style={{
                width: undefined,
                height: undefined,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
                transformOrigin: "center center",
              }}
              onLoad={(e) => {
                const img = e.currentTarget;
                // Natural size applied via transform scale from natural pixels
                img.style.width = `${img.naturalWidth}px`;
                img.style.height = `${img.naturalHeight}px`;
              }}
            />
          </div>
          <label className="flex items-center gap-3 text-xs">
            <span className="w-10 text-muted-foreground">Zoom</span>
            <input
              type="range"
              min={baseScale}
              max={baseScale * 3}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="rounded-xl bg-primary"
              disabled={pending}
              onClick={() => void confirmCrop()}
            >
              {pending ? "Uploading…" : "Apply crop & upload"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={pending}
              onClick={cancelCrop}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {url && !cropSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="mt-1 size-28 rounded-full border border-border object-cover"
        />
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
