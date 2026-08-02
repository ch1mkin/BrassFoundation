"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileOrUrlField } from "@/components/admin/file-or-url-field";
import { HeroBackgroundField } from "@/components/admin/hero-background-field";
import { QuotesEditor } from "@/components/admin/quotes-editor";
import { StatsEditor } from "@/components/admin/stats-editor";
import { FormLock } from "@/components/ui/form-lock";
import { useSafeFormAction } from "@/hooks/use-safe-form-action";
import {
  updateHomepageAction,
  type CmsActionState,
} from "@/lib/cms/actions";
import type { HomepageContent } from "@/lib/cms/homepage";
import { DEFAULT_HERO_FRAME } from "@/lib/cms/hero-frame";

const initial: CmsActionState = {};

function Field({
  label,
  name,
  defaultValue,
  multiline = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  multiline?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={4}
          className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      ) : (
        <Input
          name={name}
          defaultValue={defaultValue}
          className="h-10 rounded-2xl"
        />
      )}
    </label>
  );
}

export function HomepageCmsForm({ content }: { content: HomepageContent }) {
  const router = useRouter();
  const [state, action, pending] = useSafeFormAction(
    updateHomepageAction,
    initial,
  );
  const [desktopHeroUrl, setDesktopHeroUrl] = useState(
    content.hero_background_url || "",
  );

  useEffect(() => {
    setDesktopHeroUrl(content.hero_background_url || "");
  }, [content.hero_background_url]);

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <form action={action} className="mx-auto max-w-3xl space-y-8">
      <FormLock pending={pending} className="space-y-8">
        <section className="space-y-4 rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="font-heading text-xl font-medium">Hero</h2>
          <HeroBackgroundField
            key={`desktop-hero|${content.hero_background_url || ""}|${content.hero_bg_frame.focusX}|${content.hero_bg_frame.focusY}|${content.hero_bg_frame.zoom}`}
            urlName="hero_background_url"
            focusXName="hero_bg_focus_x"
            focusYName="hero_bg_focus_y"
            zoomName="hero_bg_zoom"
            label="Hero background — desktop"
            hint="Shown on tablet/desktop (md+). Drag to move, zoom to crop. Bake crop publishes immediately."
            bucket="gallery"
            folder="hero"
            variant="desktop"
            defaultUrl={content.hero_background_url || undefined}
            defaultFrame={content.hero_bg_frame || DEFAULT_HERO_FRAME}
            onUrlChange={setDesktopHeroUrl}
          />
          <HeroBackgroundField
            key={`mobile-hero|${content.hero_background_mobile_url || ""}|${content.hero_bg_mobile_frame.focusX}|${content.hero_bg_mobile_frame.focusY}|${content.hero_bg_mobile_frame.zoom}`}
            urlName="hero_background_mobile_url"
            focusXName="hero_bg_mobile_focus_x"
            focusYName="hero_bg_mobile_focus_y"
            zoomName="hero_bg_mobile_zoom"
            label="Hero background — mobile"
            hint="Optional separate image. If empty, the desktop image is reused on phones — you can still drag/zoom the mobile frame below."
            bucket="gallery"
            folder="hero-mobile"
            variant="mobile"
            defaultUrl={content.hero_background_mobile_url || undefined}
            defaultFrame={content.hero_bg_mobile_frame || DEFAULT_HERO_FRAME}
            previewFallbackUrl={desktopHeroUrl || undefined}
          />
          <Field
            label="Eyebrow"
            name="hero_eyebrow"
            defaultValue={content.hero_eyebrow}
          />
          <Field
            label="Headline (use new line for break)"
            name="hero_headline"
            defaultValue={content.hero_headline}
            multiline
          />
          <Field
            label="Subheadline"
            name="hero_subheadline"
            defaultValue={content.hero_subheadline}
            multiline
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Primary CTA label"
              name="hero_cta_primary_label"
              defaultValue={content.hero_cta_primary_label}
            />
            <Field
              label="Primary CTA link"
              name="hero_cta_primary_href"
              defaultValue={content.hero_cta_primary_href}
            />
            <Field
              label="Secondary CTA label"
              name="hero_cta_secondary_label"
              defaultValue={content.hero_cta_secondary_label}
            />
            <Field
              label="Secondary CTA link"
              name="hero_cta_secondary_href"
              defaultValue={content.hero_cta_secondary_href}
            />
          </div>
          <h3 className="pt-2 text-sm font-semibold text-muted-foreground">
            Punjabi (optional — instant switch; else Google Translate)
          </h3>
          <Field
            label="ਪੰਜਾਬੀ eyebrow"
            name="hero_eyebrow_pa"
            defaultValue={content.hero_eyebrow_pa || ""}
          />
          <Field
            label="ਪੰਜਾਬੀ headline"
            name="hero_headline_pa"
            defaultValue={content.hero_headline_pa || ""}
            multiline
          />
          <Field
            label="ਪੰਜਾਬੀ subheadline"
            name="hero_subheadline_pa"
            defaultValue={content.hero_subheadline_pa || ""}
            multiline
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="ਪੰਜਾਬੀ primary CTA"
              name="hero_cta_primary_label_pa"
              defaultValue={content.hero_cta_primary_label_pa || ""}
            />
            <Field
              label="ਪੰਜਾਬੀ secondary CTA"
              name="hero_cta_secondary_label_pa"
              defaultValue={content.hero_cta_secondary_label_pa || ""}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl bg-card p-6 shadow-soft">
          <StatsEditor
            initial={content.stats.map((s) => ({
              label: s.label,
              value: s.value,
              suffix: s.suffix || "+",
              icon: s.icon || "groups",
            }))}
          />
        </section>

        <section className="space-y-4 rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="font-heading text-xl font-medium">About</h2>
          <Field
            label="Eyebrow"
            name="about_eyebrow"
            defaultValue={content.about_eyebrow}
          />
          <Field
            label="Headline"
            name="about_headline"
            defaultValue={content.about_headline}
            multiline
          />
          <Field
            label="Body"
            name="about_body"
            defaultValue={content.about_body}
            multiline
          />
          <Field
            label="ਪੰਜਾਬੀ about headline"
            name="about_headline_pa"
            defaultValue={content.about_headline_pa || ""}
            multiline
          />
          <Field
            label="ਪੰਜਾਬੀ about body"
            name="about_body_pa"
            defaultValue={content.about_body_pa || ""}
            multiline
          />
        </section>

        <section className="space-y-4 rounded-2xl bg-card p-6 shadow-soft">
          <QuotesEditor initial={content.about_quotes} />
        </section>

        <section className="space-y-4 rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="font-heading text-xl font-medium">
            Section backgrounds
          </h2>
          <FileOrUrlField
            name="events_background_url"
            label="Upcoming Events background image"
            bucket="gallery"
            accept="image/*"
            folder="events-bg"
            defaultUrl={content.events_background_url || undefined}
          />
          <FileOrUrlField
            name="admin_background_url"
            label="Admin portal background image"
            bucket="gallery"
            accept="image/*"
            folder="admin-bg"
            defaultUrl={content.admin_background_url || undefined}
          />
        </section>

        <section className="space-y-4 rounded-2xl bg-card p-6 shadow-soft">
          <h2 className="font-heading text-xl font-medium">Membership CTA</h2>
          <Field
            label="Headline"
            name="membership_headline"
            defaultValue={content.membership_headline}
          />
          <Field
            label="Body"
            name="membership_body"
            defaultValue={content.membership_body}
            multiline
          />
          <Field
            label="ਪੰਜਾਬੀ membership headline"
            name="membership_headline_pa"
            defaultValue={content.membership_headline_pa || ""}
          />
          <Field
            label="ਪੰਜਾਬੀ membership body"
            name="membership_body_pa"
            defaultValue={content.membership_body_pa || ""}
            multiline
          />
        </section>

        {state.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="text-sm text-success" role="status">
            {state.success}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="rounded-2xl"
        >
          {pending ? "Saving…" : "Save homepage"}
        </Button>
      </FormLock>
    </form>
  );
}
