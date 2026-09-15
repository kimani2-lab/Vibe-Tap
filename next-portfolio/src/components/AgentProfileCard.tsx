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
  services_offered: {
    category_name: string;
    slug: string;
    description: string;
  }[];
  app_download_url: string;
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
      <SasaPaySymbol className="w-8 h-9" />
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

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-[36px] bg-[#002b2b] border border-cyan-950 shadow-2xl font-sans">
      
      {/* 1. Header Banner */}
      <header className="relative h-48 w-full bg-white p-5 overflow-hidden flex flex-col justify-between">
        
        {/* Top Header Row: Logo & VERIFIED Badge */}
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <SasaPayLogo />
            <p className="mt-2 text-[0.6rem] font-bold uppercase tracking-widest text-slate-800">
              SASAPAY
            </p>
            <p className="text-[0.62rem] text-slate-500 font-medium">
              Authorized agent network
            </p>
          </div>

          <span className="bg-[#0b1e28] text-white text-[0.6rem] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest">
            VERIFIED
          </span>
        </div>

        {/* Decorative Brand SVG Arcs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 360 190" preserveAspectRatio="none" fill="none">
            {/* Left Arch framing Avatar (Red inside, Blue outside) */}
            <circle cx="65" cy="190" r="72" stroke="#e61c24" strokeWidth="18" />
            <circle cx="65" cy="190" r="92" stroke="#0088ff" strokeWidth="16" />

            {/* Right Sweeping Arc */}
            <circle cx="340" cy="50" r="102" stroke="#0088ff" strokeWidth="20" />
            <circle cx="340" cy="50" r="124" stroke="#e61c24" strokeWidth="18" />
          </svg>
        </div>

        {/* Center Seam Symbol */}
        <div className="absolute left-1/2 bottom-1 -translate-x-1/2 z-20">
          <SasaPaySymbol className="w-4 h-5" />
        </div>
      </header>

      {/* 2. Main Dark Card Body */}
      <div className="bg-[#002b2b] px-5 pb-6 pt-1 relative z-10">
        
        {/* Avatar & Verified Status Row */}
        <div className="flex justify-between items-end -mt-16 mb-4 relative z-20">
          <div className="w-24 h-24 rounded-full border-4 border-[#002b2b] overflow-hidden bg-slate-800 shadow-xl ml-1">
            <img 
              src={agent.avatar_url || fallbackAvatar} 
              alt={agent.full_name} 
              onError={(e) => { e.currentTarget.src = fallbackAvatar; }}
              className="w-full h-full object-cover" 
            />
          </div>

          {agent.is_verified && (
            <span className="bg-[#003838] border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 mb-1">
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
            className="bg-[#003838] border border-cyan-900/50 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#004040] transition"
          >
            <Icon name="phone" /> Call Agent
          </a>
          <a 
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#003838] border border-cyan-900/50 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#004040] transition"
          >
            <Icon name="whatsapp" /> WhatsApp
          </a>
        </div>

        {/* Collapsible Ecosystem Products */}
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowProducts(!showProducts)}
            aria-expanded={showProducts}
            className="w-full bg-[#002222] border border-cyan-900/60 p-3.5 rounded-xl flex justify-between items-center text-left hover:border-cyan-500/40 transition"
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
                <div key={p.slug} className="bg-[#002222] border border-cyan-900/60 p-3.5 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.target}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-cyan-950/80">
                    <a
                      href={`${p.app_store_url}?ref=${encodeURIComponent(agent.referral_code)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-cyan-300 hover:text-white bg-[#003838] border border-cyan-800/40 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                    >
                       App Store
                    </a>
                    <a
                      href={`${p.play_store_url}&referrer=${encodeURIComponent(agent.referral_code)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-slate-300 hover:text-white bg-[#003838] border border-cyan-800/40 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
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
            <span className="text-cyan-400 font-normal lowercase">{agent.services_offered.length} available</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {agent.services_offered.map((service) => (
              <div key={service.slug} className="bg-[#003535] border border-cyan-900/40 rounded-xl px-3 py-2.5 text-xs text-white flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                  <Icon name="check" />
                </span>
                <span className="truncate">{service.category_name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <AgentQRCode slug={agent.slug} agentName={agent.full_name} />
        </div>

      </div>
    </div>
  );
}