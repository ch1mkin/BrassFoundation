"use client";

import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";

/**
 * Pre-permission dialog so users understand why the browser will ask
 * for camera access (required for a reliable prompt on all browsers).
 */
export function CameraPermissionPrompt({
  open,
  title,
  description,
  allowLabel = "Allow camera",
  onAllow,
  onUploadInstead,
  onCancel,
  className,
}: {
  open: boolean;
  title: string;
  description: string;
  allowLabel?: string;
  onAllow: () => void;
  onUploadInstead?: () => void;
  onCancel: () => void;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 sm:items-center",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-permission-title"
      onClick={onCancel}
    >
      <div
        className="glass-card w-full max-w-md space-y-4 rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MaterialIcon name="visibility" className="text-[22px]" />
          </div>
          <div>
            <h3
              id="camera-permission-title"
              className="font-heading text-lg font-semibold"
            >
              {title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <ul className="space-y-1.5 rounded-xl bg-surface-low px-3 py-3 text-xs text-muted-foreground">
          <li>· Your browser will show its own camera permission next.</li>
          <li>· Choose Allow so you can take the photo in this form.</li>
          <li>· Photos stay with your membership application only.</li>
        </ul>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            className="h-11 rounded-xl bg-primary"
            onClick={onAllow}
          >
            {allowLabel}
          </Button>
          {onUploadInstead ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={onUploadInstead}
            >
              Upload from gallery instead
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-xl"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
