"use client";

import { useState } from "react";
import AgentQRCode from "./AgentQRCode";
import { SASAPAY_APP_STORE_MAIN,SASAPAY_PLAY_STORE_MAIN, sasaPayProducts } from "@/lib/data";

export interface AgentData {
  agent_id: string;
  slug: string;
  full_name: string;
  headline: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  is_verified: boolean;
  referral_code: string;
  services_offered?:
    | string[]
    | { name?: string; category_name?: string; slug?: string; description?: string }[];
  app_download_url: string;
  payment_url?: string;
}

/**
 * Official SasaPay Logo Mark
 * Two distinct angled capsules: Blue (top-left) and Red (bottom-right)
 */
function SasaPaySymbol({ className = "w-6 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g transform="rotate(-40 24 24)">
        <rect x="12" y="8" width="10" height="22" rx="5" fill="#0088ff" />
        <rect x="26" y="18" width="10" height="22" rx="5" fill="#e61c24" />
      </g>
    </svg>
  );
}

function SasaPayLogo() {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/sasapay-mark.svg"
        alt="SasaPay symbol"
        className="h-9 w-9 shrink-0 object-contain"
      />
      <span className="text-3xl font-black text-slate-900 tracking-tight">sasapay</span>
      <span className="text-[9px] font-bold text-slate-900 border border-slate-900 rounded px-1 py-0.2 self-start mt-1">
        SP
      </span>
    </div>
  );
}

function Icon({ name }: { name: "phone" | "whatsapp" | "arrow" | "check" }) {
  if (name === "phone") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
        <path d="M6.6 3.5h2.1l1.1 4-1.8 1.5a15.7 15.7 0 0 0 6.9 6.9l1.5-1.8 4 1.1v2.1a2 2 0 0 1-2 2C11.5 19.3 4.7 12.5 4.7 4.7a2 2 0 0 1 1.9-1.2Z" />
      </svg>
    );
  }

  if (name === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
        <path d="M20 11.7a8 8 0 0 1-11.9 7l-3.6 1 1-3.5A8 8 0 1 1 20 11.7Z" />
        <path d="M8.7 8.2c.2-.2.5-.2.7.1l.8 1c.2.2.2.5 0 .7l-.6.7c.6 1.2 1.5 2.1 2.7 2.7l.7-.6c.2-.2.5-.2.7 0l1 .8c.3.2.3.5.1.7l-.5.6c-.3.4-.8.6-1.3.5-3.1-.7-5.6-3.2-6.3-6.3-.1-.5.1-1 .5-1.3l.6-.5Z" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current" strokeWidth="2.5">
        <path d="M5 12h13M13 6l6 6-6 6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="3">
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

export default function AgentProfileCard({ agent }: { agent: AgentData }) {
  const [showProducts, setShowProducts] = useState(false);
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.full_name)}&background=0f766e&color=fff&bold=true&size=256`;
  const cleanPhone = agent.phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const services = Array.isArray(agent.services_offered)
    ? agent.services_offered
        .map((service) => {
          if (typeof service === "string") return service;
          return service.name || service.category_name || String(service);
        })
        .filter(Boolean)
    : [];

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-b-3xl border border-blue-950 bg-[#001b5e] shadow-2xl font-sans">
      
      {/* 1. Header Banner */}
      <header className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 px-5 pb-20 pt-8 sm:px-7">
        <div className="pointer-events-none absolute left-0 top-0 h-24 w-24 overflow-hidden">
          <div className="absolute -left-8 top-2 h-3 w-32 -rotate-45 bg-[#e11d48]" />
          <div className="absolute -left-8 top-5 h-3 w-32 -rotate-45 bg-[#2563eb]" />
        </div>

        <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-24 overflow-hidden">
          <div className="absolute -right-8 bottom-2 h-3 w-32 -rotate-45 bg-[#e11d48]" />
          <div className="absolute -right-8 bottom-5 h-3 w-32 -rotate-45 bg-[#2563eb]" />
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full border-[30px] border-white/50" />
          <div className="absolute -left-10 top-10 h-80 w-80 rounded-full border-[20px] border-slate-400/30" />
        </div>
        
        {/* Top Header Row: Logo & VERIFIED Badge */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <SasaPayLogo />
            <p className="mt-3 text-[0.6rem] font-bold uppercase tracking-widest text-slate-800">
              SASAPAY
            </p>
            <p className="text-[0.62rem] text-slate-500 font-medium">
              Authorized agent network
            </p>
          </div>

          <span className="flex items-center gap-2 rounded-full border-2 border-emerald-400 bg-slate-900 px-3.5 py-1.5 text-[0.6rem] font-bold tracking-widest text-white shadow-lg">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-sm text-emerald-400" aria-hidden="true">✓</span>
            VERIFIED
          </span>
        </div>

        <div className="pointer-events-none absolute bottom-16 right-8 z-10 grid grid-cols-4 gap-2 opacity-80">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} className="h-2 w-2 rounded-full bg-cyan-400 shadow-sm" />
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-12 overflow-hidden leading-none">
          <svg className="relative block h-12 w-full text-slate-950" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,20 1200,60 L1200,120 L0,120 Z" fill="currentColor" />
          </svg>
        </div>
      </header>

      {/* 2. Main Dark Card Body */}
      <div className="relative z-10 bg-gradient-to-b from-[#001b5e] via-[#00164d] to-[#001040] px-5 pb-6 pt-1">
        
        {/* Avatar & Verified Status Row */}
        <div className="flex justify-between items-end -mt-16 mb-4 relative z-20">
          <div className="ml-1 h-24 w-24 overflow-hidden rounded-full border-4 border-cyan-400 bg-slate-900 shadow-lg shadow-cyan-500/30">
            <img 
              src={agent.avatar_url || fallbackAvatar} 
              alt={agent.full_name} 
              onError={(e) => { e.currentTarget.src = fallbackAvatar; }}
              className="w-full h-full object-cover" 
            />
          </div>

          {agent.is_verified && (
            <span className="border border-emerald-500/30 bg-[#101a19] text-xs font-semibold text-emerald-400 px-3 py-1.5 rounded-full flex items-center gap-1.5 mb-1">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
              Verified Agent
            </span>
          )}
        </div>

        {/* Agent Info */}
        <div className="space-y-0.5">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">{agent.agent_id}</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">{agent.full_name}</h1>
          <p className="text-xs text-slate-300">{agent.headline}</p>
        </div>

        {/* Core SasaPay App Download CTA */}
        <a
          href={`${SASAPAY_APP_STORE_MAIN}?ref=${encodeURIComponent(agent.referral_code)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 w-full bg-[#00a3e0] hover:bg-cyan-300 text-slate-950 font-extrabold text-sm py-3 px-4 rounded-xl flex justify-center items-center gap-2 transition shadow-lg"
        >
          <span> Download SasaPay on App Store</span>
        </a>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <a 
            href={`tel:${agent.phone}`}
            className="border border-slate-700 bg-[#111111] text-xs font-semibold text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:border-cyan-500/60 hover:bg-[#181818] transition"
          >
            <Icon name="phone" /> Call Agent
          </a>
          <a 
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-slate-700 bg-[#111111] text-xs font-semibold text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:border-cyan-500/60 hover:bg-[#181818] transition"
          >
            <Icon name="whatsapp" /> WhatsApp
          </a>
        </div>

        {/* Pay Agent Button */}
        {agent.payment_url && (
          <a
            href={agent.payment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-slate-700 bg-[#111111] text-xs font-semibold text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:border-cyan-500/60 hover:bg-[#181818] transition"
          >
            <Icon name="arrow" /> SasaPay_checkout_url
          </a>
        )}

        {/* Collapsible Ecosystem Products */}
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowProducts(!showProducts)}
            aria-expanded={showProducts}
            className="w-full rounded-xl border border-slate-800 bg-[#0b0b0b] p-3.5 flex justify-between items-center text-left hover:border-cyan-500/40 transition"
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Our Ecosystem Products</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {showProducts ? "Tap to hide products" : "Tap to view all SasaPay solutions"}
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              {sasaPayProducts.length} {showProducts ? "▲" : "▼"}
            </span>
          </button>

          {showProducts && (
            <div className="space-y-2.5 mt-3 animate-fadeIn">
              {sasaPayProducts.map((p) => (
                <div key={p.slug} className="rounded-xl border border-slate-800 bg-[#0b0b0b] p-3.5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.target}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-cyan-950/80">
                    <a
                      href={`${p.app_store_url}?ref=${encodeURIComponent(agent.referral_code)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-cyan-300 hover:text-white bg-[#111111] border border-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                    >
                       App Store
                    </a>
                    <a
                      href={`${p.play_store_url}&referrer=${encodeURIComponent(agent.referral_code)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-slate-300 hover:text-white bg-[#111111] border border-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                    >
                      ▶ Play Store
                    </a>
                    <a
                      href={`${p.web_url}?agent=${encodeURIComponent(agent.referral_code)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-200 ml-auto"
                    >
                      Web →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="my-5 border-t border-cyan-900/40" />

        {/* Services Offered */}
        <div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            <span>Services Offered</span>
            <span className="text-cyan-400 font-normal lowercase">{services.length} available</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {services.length > 0 ? services.map((service, i) => (
              <div key={`${service}-${i}`} className="rounded-xl border border-slate-800 bg-[#111111] px-3 py-2.5 text-xs text-white flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                  <Icon name="check" />
                </span>
                <span className="truncate">{service}</span>
              </div>
            )) : (
              <p className="col-span-2 text-xs text-slate-500">No active services registered.</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <AgentQRCode slug={agent.slug} agentName={agent.full_name} />
        </div>

      </div>
    </div>
  );
}