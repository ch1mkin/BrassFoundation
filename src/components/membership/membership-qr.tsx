"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export function MembershipQr({
  membershipId,
  size = 160,
  className,
}: {
  membershipId: string;
  size?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        await QRCode.toCanvas(canvas, membershipId, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: size,
          color: {
            dark: "#006875",
            light: "#ffffff",
          },
        });

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.src = "/brand/logo.png";
        await new Promise<void>((resolve, reject) => {
          logo.onload = () => resolve();
          logo.onerror = () => reject(new Error("logo"));
        });

        if (cancelled) return;

        const logoSize = Math.round(size * 0.28);
        const pad = Math.round(logoSize * 0.12);
        const box = logoSize + pad * 2;
        const x = (size - box) / 2;
        const y = (size - box) / 2;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        const r = 8;
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + box, y, x + box, y + box, r);
        ctx.arcTo(x + box, y + box, x, y + box, r);
        ctx.arcTo(x, y + box, x, y, r);
        ctx.arcTo(x, y, x + box, y, r);
        ctx.closePath();
        ctx.fill();

        ctx.drawImage(logo, x + pad, y + pad, logoSize, logoSize);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void draw();
    return () => {
      cancelled = true;
    };
  }, [membershipId, size]);

  if (failed) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        title={membershipId}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(membershipId)}`}
          alt={`QR ${membershipId}`}
          width={size}
          height={size}
        />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      aria-label={`Membership QR for ${membershipId}`}
    />
  );
}
