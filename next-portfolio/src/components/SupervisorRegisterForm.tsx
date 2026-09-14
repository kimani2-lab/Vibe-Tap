"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface FormState {
  agent_id: string;
  full_name: string;
  phone: string;
  email: string;
  headline: string;
  referral_code: string;
  services_offered: string;
  card_token: string;
}

type ApiErrors = Record<string, string[] | string>;

interface RegistrationResponse {
  agent_id: string;
  slug: string;
  nfc_payload_url?: string | null;
}

const initialForm: FormState = {
  agent_id: "",
  full_name: "",
  phone: "",
  email: "",
  headline: "SasaPay Authorized Agent",
  referral_code: "",
  services_offered: "",
  card_token: "",
};

function formatErrors(errors: ApiErrors) {
  return Object.entries(errors)
    .map(([field, messages]) => {
      const text = Array.isArray(messages) ? messages.join(" ") : messages;
      return `${field.replaceAll("_", " ")}: ${text}`;
    })
    .join(" ");
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
      />
    </label>
  );
}

export default function SupervisorRegisterForm() {
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    const payload = {
      agent_id: form.agent_id.trim(),
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      headline: form.headline.trim(),
      referral_code: form.referral_code.trim(),
      services_offered: form.services_offered
        .split(",")
        .map((service) => service.trim())
        .filter(Boolean),
      ...(form.card_token.trim() ? { card_token: form.card_token.trim() } : {}),
    };

    try {
      const response = await fetch("/api/v1/agent/register/", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ApiErrors & RegistrationResponse;

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: formatErrors(data) || "Registration could not be completed.",
        });
        return;
      }

      setForm(initialForm);
      setFeedback({
        type: "success",
        message: data.nfc_payload_url
          ? `Agent ${data.agent_id} registered. NFC link ready: ${data.nfc_payload_url}`
          : `Agent ${data.agent_id} registered successfully.`,
      });
    } catch {
      setFeedback({
        type: "error",
        message: "The registration service is unavailable. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-8 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">Supervisor console</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Register an agent</h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
            Create a verified profile and optionally program its NFC wristband in one step.
          </p>
        </div>
        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 sm:flex dark:text-cyan-400" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8">
            <path d="M7 7.5A5 5 0 0 1 12 3a5 5 0 0 1 5 4.5M5 11.5A7 7 0 0 1 12 5a7 7 0 0 1 7 6.5M3 15.5A9 9 0 0 1 12 7a9 9 0 0 1 9 8.5M12 21v.01" />
          </svg>
        </div>
      </div>

      {feedback ? (
        <div role="status" className={`mb-6 rounded-2xl border px-4 py-3 text-sm leading-6 ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"}`}>
          {feedback.message}
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-7">
        <div>
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Identity</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Agent ID" name="agent_id" value={form.agent_id} onChange={updateField} placeholder="AG-8821" required />
            <Field label="Full name" name="full_name" value={form.full_name} onChange={updateField} placeholder="Allan Kimani" required />
            <Field label="Phone" name="phone" value={form.phone} onChange={updateField} placeholder="+254 700 000 000" required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} placeholder="agent@example.com" required />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-7 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Agent profile</h2>
          <div className="mt-4 space-y-5">
            <Field label="Headline" name="headline" value={form.headline} onChange={updateField} placeholder="SasaPay Authorized Agent" required />
            <Field label="Referral code" name="referral_code" value={form.referral_code} onChange={updateField} placeholder="ALLAN8821" required />
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Services offered</span>
              <input name="services_offered" value={form.services_offered} onChange={updateField} placeholder="Cash in, Cash out, Bill payments" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500" />
              <span className="mt-2 block text-xs text-slate-400">Separate multiple services with commas.</span>
            </label>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-7 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">NFC assignment <span className="font-normal text-slate-400">(optional)</span></h2>
          <div className="mt-4">
            <Field label="Card token" name="card_token" value={form.card_token} onChange={updateField} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" aria-hidden="true" />
              Registering agent...
            </>
          ) : "Register agent"}
        </button>
      </form>
    </section>
  );
}
