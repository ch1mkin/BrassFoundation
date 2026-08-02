"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SIGNATURE_W = 480;
const SIGNATURE_H = 160;

async function cropToSignatureFrame(source: ImageBitmap | HTMLVideoElement) {
  const srcW =
    "videoWidth" in source ? source.videoWidth : (source as ImageBitmap).width;
  const srcH =
    "videoHeight" in source
      ? source.videoHeight
      : (source as ImageBitmap).height;
  if (!srcW || !srcH) throw new Error("Could not read image.");

  const targetRatio = SIGNATURE_W / SIGNATURE_H;
  const srcRatio = srcW / srcH;
  let cropW = srcW;
  let cropH = srcH;
  let sx = 0;
  let sy = 0;

  if (srcRatio > targetRatio) {
    cropW = Math.round(srcH * targetRatio);
    sx = Math.round((srcW - cropW) / 2);
  } else {
    cropH = Math.round(srcW / targetRatio);
    sy = Math.round((srcH - cropH) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = SIGNATURE_W;
  canvas.height = SIGNATURE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process signature.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, SIGNATURE_W, SIGNATURE_H);
  ctx.drawImage(source, sx, sy, cropW, cropH, 0, 0, SIGNATURE_W, SIGNATURE_H);
  return canvas.toDataURL("image/png");
}

export function SignaturePad({
  onChange,
  className,
}: {
  onChange: (dataUrl: string | null) => void;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<"draw" | "photo">("draw");
  const [hasInk, setHasInk] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ratio = window.devicePixelRatio || 1;
    const width = parent.clientWidth;
    const height = 160;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#0B1C28";
    }
  }, []);

  useEffect(() => {
    if (mode !== "draw") return;
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [mode, resize]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function startCamera() {
    setPhotoError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setPhotoError(
        "Camera access was denied. You can upload a photo of your signature instead.",
      );
    }
  }

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    canvasRef.current?.setPointerCapture(e.pointerId);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasInk(true);
  }

  function end() {
    drawing.current = false;
    if (hasInk && canvasRef.current) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  }

  function clearDraw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
    resize();
  }

  function clearAll() {
    stopCamera();
    setHasInk(false);
    setPhotoPreview(null);
    onChange(null);
    if (mode === "draw") clearDraw();
  }

  async function captureFromVideo() {
    const video = videoRef.current;
    if (!video) return;
    setBusy(true);
    setPhotoError(null);
    try {
      const dataUrl = await cropToSignatureFrame(video);
      setPhotoPreview(dataUrl);
      onChange(dataUrl);
      setHasInk(true);
      stopCamera();
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Could not capture signature.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setPhotoError(null);
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please choose a photo of your signature.");
      }
      const bitmap = await createImageBitmap(file);
      const dataUrl = await cropToSignatureFrame(bitmap);
      bitmap.close();
      setPhotoPreview(dataUrl);
      onChange(dataUrl);
      setHasInk(true);
      stopCamera();
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Could not use that photo.",
      );
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: "draw" | "photo") {
    if (next === mode) return;
    stopCamera();
    setHasInk(false);
    setPhotoPreview(null);
    onChange(null);
    setPhotoError(null);
    setMode(next);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => switchMode("draw")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            mode === "draw"
              ? "bg-primary text-white"
              : "bg-surface-highest text-muted-foreground hover:text-foreground",
          )}
        >
          Draw signature
        </button>
        <button
          type="button"
          onClick={() => switchMode("photo")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
            mode === "photo"
              ? "bg-primary text-white"
              : "bg-surface-highest text-muted-foreground hover:text-foreground",
          )}
        >
          Take / upload photo
        </button>
      </div>

      {mode === "draw" ? (
        <>
          <div className="rounded-xl border border-dashed border-input bg-white">
            <canvas
              ref={canvasRef}
              className="touch-none w-full cursor-crosshair rounded-xl"
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
            />
          </div>
          <button
            type="button"
            onClick={clearDraw}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear signature
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Capture or upload a photo of your handwritten signature. It is
            automatically cropped to a signature-sized frame.
          </p>
          <div className="relative mx-auto aspect-[3/1] w-full max-w-lg overflow-hidden rounded-xl border border-dashed border-input bg-white">
            {cameraOn ? (
              <video
                ref={videoRef}
                playsInline
                muted
                className="size-full object-cover"
              />
            ) : photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="Signature preview"
                className="size-full object-contain bg-white"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 px-4 text-center text-xs text-muted-foreground">
                <span>Signature frame (auto-crop)</span>
                <span className="text-[10px] opacity-70">
                  {SIGNATURE_W}×{SIGNATURE_H}px
                </span>
              </div>
            )}
            {/* Guide overlay */}
            <div className="pointer-events-none absolute inset-3 rounded-md border border-primary/30" />
          </div>

          <div className="flex flex-wrap gap-2">
            {!cameraOn ? (
              <button
                type="button"
                onClick={() => void startCamera()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
              >
                Open camera
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void captureFromVideo()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {busy ? "Capturing…" : "Capture & crop"}
              </button>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
            >
              Upload photo
            </button>
            {(hasInk || cameraOn) && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              void onFile(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />
          {photoError ? (
            <p className="text-xs text-destructive" role="alert">
              {photoError}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
