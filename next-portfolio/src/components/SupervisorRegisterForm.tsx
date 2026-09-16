"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface FormState {
  agent_id: string;
  full_name: string;
  phone: string;
  email: string;
  headline: string;
  services_offered: string[];
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
  services_offered: [],
};

const serviceOptions = ["Cash In", "Cash Out", "Bill Payments", "Merchant Tills"];
const registrationUrl = "/api/agent/register";

// Helper to parse DRF validation error dictionaries
const formatErrors = (errors: any): string => {
  if (typeof errors === "string") return errors;

  if (typeof errors === "object" && errors !== null) {
    // If DRF returns {"errors": {"email": ["Agent with this Email already exists."]}}
    const target = errors.errors || errors.detail || errors;

    if (typeof target === "string") return target;

    return Object.entries(target)
      .map(([field, messages]) => {
        const msgList = Array.isArray(messages) ? messages.join(", ") : String(messages);
        return `${field.toUpperCase()}: ${msgList}`;
      })
      .join(" | ");
  }

  return "An unexpected validation error occurred.";
};

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
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
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
        className="h-12 w-full rounded-xl border border-cyan-500/30 bg-white/10 px-4 text-sm text-slate-100 outline-none backdrop-blur-md transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
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

  const toggleService = (service: string) => {
    setForm((current) => ({
      ...current,
      services_offered: current.services_offered.includes(service)
        ? current.services_offered.filter((selected) => selected !== service)
        : [...current.services_offered, service],
    }));
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
      services_offered: form.services_offered,
    };

    try {
      const response = await fetch(registrationUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const responseText = await response.text();
      let data: (ApiErrors & RegistrationResponse) | null = null;

      try {
        data = responseText ? (JSON.parse(responseText) as ApiErrors & RegistrationResponse) : null;
      } catch {
        console.error("Registration API returned a non-JSON response:", responseText);
      }

if (!response.ok) {
      console.error("DRF Validation Payload:", JSON.stringify(data, null, 2));
      
      setFeedback({
        type: "error",
        message: formatErrors(data),
      });
      return;
    }

      if (!data) {
        throw new Error("The registration API returned an empty response.");
      }

      console.log("Agent registered successfully:", data);
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
    <section className="w-full rounded-2xl border border-cyan-300/20 bg-[#001c54]/80 p-5 text-white shadow-2xl shadow-blue-950/80 backdrop-blur-md sm:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Supervisor console</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Register an agent</h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100/70">
            Create a verified profile and optionally program its NFC wristband in one step.
          </p>
        </div>
        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300 sm:flex" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8">
            <path d="M7 7.5A5 5 0 0 1 12 3a5 5 0 0 1 5 4.5M5 11.5A7 7 0 0 1 12 5a7 7 0 0 1 7 6.5M3 15.5A9 9 0 0 1 12 7a9 9 0 0 1 9 8.5M12 21v.01" />
          </svg>
        </div>
      </div>

      {feedback ? (
        <div role="status" className={`mb-6 rounded-2xl border px-4 py-3 text-sm leading-6 ${feedback.type === "success" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>
          {feedback.message}
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-6">
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-cyan-300">Identity details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Agent ID" name="agent_id" value={form.agent_id} onChange={updateField} placeholder="AG-8821" required />
            <Field label="Full name" name="full_name" value={form.full_name} onChange={updateField} placeholder="Allan Kimani" required />
            <Field label="Phone" name="phone" value={form.phone} onChange={updateField} placeholder="+254 700 000 000" required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={updateField} placeholder="agent@example.com" required />
          </div>
        </div>

        <div className="border-t border-cyan-200/10 pt-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-cyan-300">Agent profile</h2>
          <div className="space-y-4">
            <Field label="Headline" name="headline" value={form.headline} onChange={updateField} placeholder="SasaPay Authorized Agent" required />
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Services offered</span>
              <div className="flex flex-wrap gap-2">
                {serviceOptions.map((service) => {
                  const isSelected = form.services_offered.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      aria-pressed={isSelected}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${isSelected ? "border-cyan-400 bg-cyan-500 font-bold text-slate-950" : "border-slate-700 bg-slate-900/40 text-slate-300 hover:border-cyan-500/50"}`}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-950/40 p-3 text-xs text-cyan-300">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
          <span>Referral code and card token will be automatically assigned upon creation.</span>
        </div>

        <button type="submit" disabled={isSubmitting} className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60">
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
