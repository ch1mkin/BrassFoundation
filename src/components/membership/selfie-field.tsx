"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CameraPermissionPrompt } from "@/components/membership/camera-permission-prompt";
import {
  captureVideoFrameToJpeg,
  requestCameraStream,
  stopMediaStream,
} from "@/lib/membership/camera";
import { cn } from "@/lib/utils";

async function fileToJpegDataUrl(
  file: File,
  maxEdge = 720,
  quality = 0.82,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

export function SelfieField({
  name = "avatar_data_url",
  required = true,
  className,
  onReadyChange,
}: {
  name?: string;
  required?: boolean;
  className?: string;
  onReadyChange?: (ready: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => stopMediaStream(streamRef.current);
  }, []);

  useEffect(() => {
    if (!cameraOn || !streamRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = streamRef.current;
    video.muted = true;
    video.setAttribute("playsinline", "true");
    void video.play().catch(() => {
      setError(
        "Could not start the camera preview. Try again or upload from gallery.",
      );
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      setCameraOn(false);
    });
  }, [cameraOn]);

  function stopCamera() {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    setCameraOn(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function onPick(file: File | null) {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please choose a photo.");
      }
      if (file.size > 12 * 1024 * 1024) {
        throw new Error("Photo must be under 12MB.");
      }
      const dataUrl = await fileToJpegDataUrl(file);
      stopCamera();
      setPreview(dataUrl);
      onReadyChange?.(true);
    } catch (err) {
      setPreview(null);
      onReadyChange?.(false);
      setError(err instanceof Error ? err.message : "Could not use that photo.");
    } finally {
      setBusy(false);
    }
  }

  async function openLiveCamera() {
    setPromptOpen(false);
    setError(null);
    setBusy(true);
    stopCamera();
    const result = await requestCameraStream("user");
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    streamRef.current = result.stream;
    setCameraOn(true);
  }

  async function snapSelfie() {
    const video = videoRef.current;
    if (!video) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await captureVideoFrameToJpeg(video);
      setPreview(dataUrl);
      onReadyChange?.(true);
      stopCamera();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not capture selfie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <span className="ml-1 text-sm font-medium text-muted-foreground">
        Profile photo / selfie {required ? "*" : "(optional)"}
      </span>

      <CameraPermissionPrompt
        open={promptOpen}
        title="Allow camera for your selfie"
        description="We need camera access so you can take a profile selfie for membership. Your browser will ask you to Allow camera next — please choose Allow."
        allowLabel="Continue & allow camera"
        onAllow={() => void openLiveCamera()}
        onUploadInstead={() => {
          setPromptOpen(false);
          galleryRef.current?.click();
        }}
        onCancel={() => setPromptOpen(false)}
      />

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-low ring-2 ring-primary/10">
          {cameraOn ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="size-full scale-x-[-1] object-cover"
            />
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Profile preview"
              className="size-full object-cover"
            />
          ) : (
            <span className="px-3 text-center text-xs text-muted-foreground">
              Your photo
            </span>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:max-w-xs">
          <input
            ref={cameraFileRef}
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            onChange={(e) => {
              void onPick(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              void onPick(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />

          {cameraOn ? (
            <>
              <Button
                type="button"
                className="rounded-xl bg-primary"
                disabled={busy}
                onClick={() => void snapSelfie()}
              >
                {busy ? "Capturing…" : "Capture selfie"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={busy}
                onClick={stopCamera}
              >
                Close camera
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={busy}
                onClick={() => {
                  setError(null);
                  setPromptOpen(true);
                }}
              >
                {busy ? "Opening camera…" : "Take selfie with camera"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={busy}
                onClick={() => cameraFileRef.current?.click()}
              >
                Phone camera / files
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={busy}
                onClick={() => galleryRef.current?.click()}
              >
                Upload from gallery
              </Button>
            </>
          )}

          {preview && !cameraOn ? (
            <button
              type="button"
              className="text-xs font-medium text-destructive hover:underline"
              onClick={() => {
                setPreview(null);
                onReadyChange?.(false);
              }}
            >
              Remove photo
            </button>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Allow camera when your browser asks. This photo appears on your
            profile icon, member portal, and org tree.
          </p>
        </div>
      </div>

      <input
        type="hidden"
        name={name}
        value={preview || ""}
        required={required}
      />
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
