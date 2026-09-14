"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface AgentQRCodeProps {
  slug: string;
  agentName: string;
}

export default function AgentQRCode({ slug, agentName }: AgentQRCodeProps) {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const [targetUrl, setTargetUrl] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTargetUrl(`${window.location.origin}/c/${encodeURIComponent(slug)}`);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [slug]);

  const downloadQrCode = () => {
    const svg = qrContainerRef.current?.querySelector("svg");
    if (!svg || !targetUrl) return;

    const serializedSvg = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = 128 * scale;
      canvas.height = 128 * scale;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(svgUrl);
        return;
      }

      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(svgUrl);

      const downloadLink = document.createElement("a");
      downloadLink.download = `${slug}-qr-code.png`;
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.click();
    };

    image.onerror = () => URL.revokeObjectURL(svgUrl);
    image.src = svgUrl;
  };

  return (
    <section className="rounded-2xl border border-cyan-900/60 bg-[#002222] p-3 text-center" aria-labelledby="agent-qr-heading">
      <h2 id="agent-qr-heading" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
        Share {agentName}&apos;s profile
      </h2>
      <div ref={qrContainerRef} className="mx-auto mt-3 w-fit rounded-lg bg-white p-2 shadow-lg shadow-black/20">
        {targetUrl ? (
          <QRCodeSVG
            value={targetUrl}
            size={128}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#002B2B"
            aria-label={`QR code for ${agentName}'s profile`}
          />
        ) : (
          <div className="h-32 w-32 animate-pulse rounded bg-slate-200" aria-label="Generating QR code" />
        )}
      </div>
      <button
        type="button"
        onClick={downloadQrCode}
        disabled={!targetUrl}
        className="mt-3 inline-flex items-center justify-center rounded-xl border border-cyan-700/60 bg-[#003838] px-3.5 py-2 text-sm font-semibold text-cyan-200 transition hover:border-cyan-400/70 hover:bg-[#004040] focus:outline-none focus:ring-4 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Download QR Code
      </button>
    </section>
  );
}
