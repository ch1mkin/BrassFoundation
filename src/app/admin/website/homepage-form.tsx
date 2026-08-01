"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateHomepageAction,
  type CmsActionState,
} from "@/lib/cms/actions";
import type { HomepageContent } from "@/lib/cms/homepage";
import { StatsEditor } from "@/components/admin/stats-editor";

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
  const [state, action, pending] = useActionState(
    updateHomepageAction,
    initial,
  );

  return (
    <form action={action} className="mx-auto max-w-3xl space-y-8">
      <section className="space-y-4 rounded-2xl bg-card p-6 shadow-soft">
        <h2 className="font-heading text-xl font-medium">Hero</h2>
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

      <Button type="submit" size="lg" disabled={pending} className="rounded-2xl">
        {pending ? "Saving…" : "Save homepage"}
      </Button>
    </form>
  );
}
