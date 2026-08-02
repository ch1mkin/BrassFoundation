"use client";

import * as pdfjs from "pdfjs-dist";
import { uploadFileClient } from "@/lib/storage/client-upload";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export async function renderPdfFirstPageThumbnail(
  file: File,
): Promise<File | null> {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    if (!blob) return null;
    return new File([blob], `${file.name.replace(/\.pdf$/i, "")}-thumb.jpg`, {
      type: "image/jpeg",
    });
  } catch {
    return null;
  }
}

/**
 * Client-side PDF + thumbnail upload (avoids hanging server-action File uploads).
 */
export async function uploadPdfWithThumbnail(file: File, folder = "library") {
  const pdfUpload = await uploadFileClient("resources", file, folder);
  if (!pdfUpload.ok) return pdfUpload;

  const thumbFile = await renderPdfFirstPageThumbnail(file);
  if (!thumbFile) {
    return { ...pdfUpload, thumbnailUrl: null as string | null };
  }

  const thumbUpload = await uploadFileClient(
    "resources",
    thumbFile,
    `${folder}/thumbs`,
  );

  return {
    ...pdfUpload,
    thumbnailUrl: thumbUpload.ok ? thumbUpload.url : null,
  };
}
