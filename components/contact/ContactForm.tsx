"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";

type State = { kind: "idle" } | { kind: "pending" } | { kind: "success" } | { kind: "error"; message: string };

export function ContactForm() {
  const t = useTranslations("contact.form");
  const locale = useLocale();
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ kind: "pending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? String(res.status));
      }
      setState({ kind: "success" });
      form.reset();
    } catch (err) {
      setState({ kind: "error", message: err instanceof Error ? err.message : "unknown" });
    }
  }

  const pending = state.kind === "pending";
  return (
    <form onSubmit={onSubmit} className="mt-8 grid max-w-2xl gap-6" noValidate={false}>
      <div className="grid gap-2">
        <label htmlFor="contact-email" className="mono-label text-ink-3">
          {t("email")}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-12 rounded-sm border border-rule-strong bg-paper-2 px-3 text-ink outline-none transition-colors duration-(--dur-1) focus:border-signal"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="contact-message" className="mono-label text-ink-3">
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={20}
          maxLength={4000}
          rows={6}
          className="rounded-sm border border-rule-strong bg-paper-2 px-3 py-2 text-ink outline-none transition-colors duration-(--dur-1) focus:border-signal"
        />
      </div>
      {/* Honeypot: hidden from people, filled by naive bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex items-center gap-6">
        <button
          type="submit"
          disabled={pending}
          className="mono-label h-11 rounded-sm bg-ink px-5 text-paper transition-[transform,background] duration-(--dur-1) hover:bg-signal hover:text-on-signal active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? t("sending") : t("send")}
        </button>
        <p aria-live="polite" className={`text-sm ${state.kind === "error" ? "text-ink" : "text-signal"}`}>
          {state.kind === "success" ? t("success") : state.kind === "error" ? t("error") : ""}
        </p>
      </div>
    </form>
  );
}
