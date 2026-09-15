"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export interface PortfolioData {
  slug: string;
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  avatar_url: string | null;
  socials: { name: string; url: string }[];
  projects: { title: string; desc: string; tech: string[]; link?: string }[];
}

export function downloadVCard(profile: {
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
}) {
  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name}
TITLE:${profile.headline}
EMAIL;TYPE=INTERNET,HOME:${profile.email}
TEL;TYPE=CELL:${profile.phone}
ADR;TYPE=HOME:;;${profile.location};;;;
END:VCARD`;

  const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${profile.full_name.replace(/\s+/g, "_")}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function PortfolioProfileCard({ profile }: { profile: PortfolioData }) {
  const [showProjects, setShowProjects] = useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/c/${profile.slug}`
      : `https://tapfolio.app/c/${profile.slug}`;

  const downloadQRCode = () => {
    const svg = document.getElementById("portfolio-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `${profile.slug}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[36px] bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 border border-slate-200 shadow-2xl font-sans text-slate-800">
      
      {/* ================= VECTOR BACKGROUND LAYERS ================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 400 700"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft Glow Radial Gradient for Left Circle */}
            <radialGradient id="leftGlow" cx="0" cy="200" r="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00bfff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* Diagonal Stripe Linear Gradient */}
            <linearGradient id="blueBarGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00c6ff" />
              <stop offset="100%" stopColor="#0052d4" />
            </linearGradient>

            {/* Dot Matrix Pattern Definition */}
            <pattern id="dotGrid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#0099ff" opacity="0.6" />
            </pattern>
          </defs>

          {/* Left Large Glow Arc Framing Avatar */}
          <circle cx="-10" cy="220" r="170" fill="url(#leftGlow)" />
          <circle cx="-10" cy="220" r="170" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />

          {/* Top-Left Diagonal Bars */}
          <rect x="-40" y="10" width="160" height="22" rx="11" fill="url(#blueBarGrad)" transform="rotate(-40 0 0)" />
          <rect x="-10" y="30" width="140" height="14" rx="7" fill="#38bdf8" transform="rotate(-40 0 0)" />
          <rect x="25" y="48" width="80" height="10" rx="5" fill="#0284c7" transform="rotate(-40 0 0)" />

          {/* Top-Left Dot Matrix */}
          <rect x="80" y="22" width="72" height="36" fill="url(#dotGrid)" />

          {/* Bottom-Right Diagonal Bars */}
          <g transform="translate(400, 700) rotate(180)">
            <rect x="-40" y="10" width="160" height="22" rx="11" fill="url(#blueBarGrad)" transform="rotate(-40 0 0)" />
            <rect x="-10" y="30" width="140" height="14" rx="7" fill="#38bdf8" transform="rotate(-40 0 0)" />
            <rect x="25" y="48" width="80" height="10" rx="5" fill="#0284c7" transform="rotate(-40 0 0)" />
            <rect x="80" y="22" width="72" height="36" fill="url(#dotGrid)" />
          </g>
        </svg>
      </div>

      {/* ================= CARD CONTENT LAYER ================= */}
      <div className="relative z-10 px-5 pt-8 pb-6">
        
        {/* Header Badge */}
        <div className="flex justify-between items-center mb-6">
          <span className="bg-blue-600/10 border border-blue-500/30 text-blue-700 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
            PORTFOLIO CARD
          </span>
        </div>

        {/* Avatar */}
        <div className="mb-4">
          <div className="w-22 h-22 rounded-2xl border-4 border-white overflow-hidden bg-slate-200 shadow-xl ring-1 ring-blue-100">
            <img 
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=0088ff&color=fff&bold=true`} 
              alt={profile.full_name} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* Identity & Location */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{profile.full_name}</h1>
          <p className="text-xs text-blue-600 font-bold">{profile.headline}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">{profile.location}</p>
        </div>

        {/* Save Contact CTA */}
        <button
          type="button"
          onClick={() => downloadVCard(profile)}
          className="mt-5 w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-sm py-3.5 px-4 rounded-xl flex justify-center items-center gap-2 transition shadow-lg shadow-blue-500/25"
        >
          📇 Save Contact (.vcf)
        </button>

        {/* Exposed Phone & Email Information Box */}
        <div className="mt-4 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Phone:</span>
            <a href={`tel:${profile.phone}`} className="text-blue-700 font-bold hover:underline">
              {profile.phone}
            </a>
          </div>
          <div className="border-t border-slate-100" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">Email:</span>
            <a href={`mailto:${profile.email}`} className="text-blue-700 font-bold truncate max-w-[200px] hover:underline">
              {profile.email}
            </a>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Social Channels</p>
          <div className="flex flex-wrap gap-2">
            {profile.socials.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/90 border border-slate-200 text-xs font-semibold text-slate-700 px-3.5 py-1.5 rounded-xl hover:border-blue-400 hover:text-blue-600 transition shadow-sm"
              >
                {s.name} ↗
              </a>
            ))}
          </div>
        </div>

        <div className="my-5 border-t border-slate-200/60" />

        {/* Collapsible Featured Projects */}
        <div>
          <button
            type="button"
            onClick={() => setShowProjects(!showProjects)}
            aria-expanded={showProjects}
            className="w-full bg-white/80 backdrop-blur-md border border-slate-200 p-3.5 rounded-xl flex justify-between items-center text-left hover:border-blue-300 transition shadow-sm"
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Featured Projects</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {showProjects ? "Tap to hide projects" : "Tap to view project showcase"}
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600">
              {profile.projects.length} {showProjects ? "▲" : "▼"}
            </span>
          </button>

          {showProjects && (
            <div className="space-y-2 mt-3 animate-fadeIn">
              {profile.projects.map((proj) => (
                <div key={proj.title} className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-900">{proj.title}</h4>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline">
                        View →
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{proj.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="my-5 border-t border-slate-200/60" />

        {/* Integrated Profile QR Code */}
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Share Profile QR</p>
          <div className="rounded-xl bg-white p-3 border border-slate-100 shadow-md">
            <QRCodeSVG
              id="portfolio-qr-code"
              value={profileUrl}
              size={150}
              bgColor="#FFFFFF"
              fgColor="#0f172a"
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Scan to view <span className="text-slate-900 font-bold">{profile.full_name}</span>'s card
          </p>

          <button
            type="button"
            onClick={downloadQRCode}
            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-white transition shadow-sm"
          >
            Download QR Code
          </button>
        </div>

      </div>
      </div>
    </main>
  );
}