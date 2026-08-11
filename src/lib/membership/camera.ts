/** Cross-browser camera helpers for membership selfie / signature capture. */

export type CameraFacing = "user" | "environment";

export type CameraRequestResult =
  | { ok: true; stream: MediaStream }
  | { ok: false; error: string; code: "unsupported" | "insecure" | "denied" | "busy" | "unknown" };

export function isSecureCameraContext() {
  if (typeof window === "undefined") return false;
  return (
    window.isSecureContext ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

export function canUseLiveCamera() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

/**
 * Request a camera stream. Tries preferred facingMode, then falls back
 * to any available video device (important for desktop / Safari).
 */
export async function requestCameraStream(
  facing: CameraFacing = "user",
): Promise<CameraRequestResult> {
  if (!isSecureCameraContext()) {
    return {
      ok: false,
      code: "insecure",
      error:
        "Camera needs a secure (HTTPS) connection. Upload a photo from your gallery instead, or open this page over HTTPS.",
    };
  }
  if (!canUseLiveCamera()) {
    return {
      ok: false,
      code: "unsupported",
      error:
        "This browser cannot open the camera here. Use Upload from gallery, or try Chrome / Safari / Edge on a recent device.",
    };
  }

  const attempts: MediaStreamConstraints[] = [
    {
      audio: false,
      video: {
        facingMode: { ideal: facing },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
    {
      audio: false,
      video: { facingMode: facing },
    },
    { audio: false, video: true },
  ];

  let lastErr: unknown = null;
  for (const constraints of attempts) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return { ok: true, stream };
    } catch (err) {
      lastErr = err;
    }
  }

  const name =
    lastErr && typeof lastErr === "object" && "name" in lastErr
      ? String((lastErr as DOMException).name)
      : "";

  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      ok: false,
      code: "denied",
      error:
        "Camera permission was blocked. Allow camera access in your browser settings (or the prompt), then try again — or upload a photo instead.",
    };
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return {
      ok: false,
      code: "unsupported",
      error:
        "No camera was found on this device. Upload a photo from your gallery instead.",
    };
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return {
      ok: false,
      code: "busy",
      error:
        "The camera is already in use by another app. Close that app and try again, or upload a photo.",
    };
  }

  return {
    ok: false,
    code: "unknown",
    error:
      "Could not open the camera. Check browser permissions, then try again — or upload a photo instead.",
  };
}

export function stopMediaStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((t) => t.stop());
}

export async function captureVideoFrameToJpeg(
  video: HTMLVideoElement,
  maxEdge = 720,
  quality = 0.82,
): Promise<string> {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) throw new Error("Camera is not ready yet. Wait a moment and try again.");
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const width = Math.max(1, Math.round(w * scale));
  const height = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not capture photo.");
  // Mirror selfie preview for natural facing-camera feel
  ctx.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}
