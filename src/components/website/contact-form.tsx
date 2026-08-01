"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormLock } from "@/components/ui/form-lock";
import { Input } from "@/components/ui/input";
import { MaterialIcon } from "@/components/ui/material-icon";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "pending" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");
    setMessage(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        skipped?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        setStatus("error");
        setMessage(
          json.message ||
            json.error ||
            "Could not send your message. Please try again later.",
        );
        return;
      }

      setStatus("ok");
      setMessage(
        json.message ||
          (json.skipped
            ? "Thanks — email delivery is not configured yet. Please email us directly."
            : "Thank you. We will get back to you soon."),
      );
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  const pending = status === "pending";

  return (
    <form onSubmit={onSubmit} className="glass-card space-y-5 rounded-2xl p-6 sm:p-8">
      <FormLock pending={pending} className="space-y-5">
      <label className="block space-y-2">
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          Full name
        </span>
        <Input
          name="name"
          required
          placeholder="Your name"
          className="h-12 rounded-xl bg-white"
        />
      </label>
      <label className="block space-y-2">
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          Email
        </span>
        <Input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="h-12 rounded-xl bg-white"
        />
      </label>
      <label className="block space-y-2">
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="How can we help?"
          className="w-full rounded-xl border border-input bg-white px-3 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>

      {message ? (
        <p
          className={
            status === "error" ? "text-sm text-destructive" : "text-sm text-success"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-12 rounded-xl bg-primary px-8 shadow-lg shadow-primary/15"
      >
        {pending ? "Sending…" : "Send message"}
        <MaterialIcon name="send" className="text-[18px]" />
      </Button>
      </FormLock>
    </form>
  );
}
