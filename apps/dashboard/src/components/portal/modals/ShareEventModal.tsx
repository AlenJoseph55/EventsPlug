"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { EventData } from "@/hooks/useEvents";

interface ShareEventModalProps {
  event: EventData;
  onClose: () => void;
}

export default function ShareEventModal({ event, onClose }: ShareEventModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [qrUrl, setQrUrl] = useState("");
  const [embedLayout, setEmbedLayout] = useState("");
  const [embedLimit, setEmbedLimit] = useState("");

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/e/${user?.organizationSlug}/${event.slug}`
    : `http://localhost:3000/e/${user?.organizationSlug}/${event.slug}`;

  useEffect(() => {
    const generateQr = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(shareUrl, {
          width: 1024,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        setQrUrl(dataUrl);
      } catch (err) {
        console.error("Failed to generate high-resolution QR code:", err);
      }
    };
    generateQr();
  }, [shareUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    showToast("Standalone event link copied to clipboard!", "success");
  };

  const handleDownloadQr = () => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.download = `${event.slug}-qr.png`;
    link.href = qrUrl;
    link.click();
  };

  const getEmbedSnippet = () => {
    return `<!-- 1. Include dynamic widget loader script -->
<script type="module" src="http://localhost:5173/src/main.ts"></script>

<!-- 2. Mount custom widget element -->
<event-widget org="${user?.organizationSlug}"${embedLayout ? ` layout="${embedLayout.toLowerCase()}"` : ""}${embedLimit ? ` limit="${embedLimit}"` : ""}></event-widget>`;
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getEmbedSnippet());
    showToast("Embed snippet copied with custom overrides!", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-lg bg-bg-panel border border-border-main rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1.5 rounded-lg border border-border-main bg-bg-panel/40 transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-text-primary tracking-tight font-display">Share Event</h3>
            <p className="text-text-secondary text-xs mt-0.5 leading-normal font-medium">
              Promote your event via standalone links, high-res printable QR codes, or visual widgets.
            </p>
          </div>

          {/* 1. Direct Shareable Link */}
          <div className="space-y-2">
            <label className="block text-text-secondary text-[9px] font-bold uppercase tracking-wider">
              Standalone Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-accent-primary font-mono select-all truncate flex items-center">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="bg-accent-primary hover:bg-accent-hover text-white font-bold text-xs px-4 rounded-xl transition shadow-sm cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>

          {/* 2. QR Code and Download Block */}
          <div className="p-4 rounded-2xl bg-bg-panel-alt/50 border border-border-main flex flex-col sm:flex-row items-center gap-5">
            {qrUrl ? (
              <div className="p-2 rounded-xl bg-white flex items-center justify-center shadow-inner flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="Event QR Code" className="w-[110px] h-[110px] object-contain" />
              </div>
            ) : (
              <div className="w-[110px] h-[110px] rounded-xl bg-bg-panel border border-border-main flex items-center justify-center text-[10px] text-text-secondary animate-pulse flex-shrink-0">
                Generating QR...
              </div>
            )}
            <div className="space-y-2 flex-1 text-center sm:text-left">
              <h4 className="text-xs font-bold text-text-primary">Printable QR Code</h4>
              <p className="text-[10px] text-text-secondary leading-relaxed font-medium">
                Deploy your QR code on posters, fliers, or slide decks. Generates at a crisp 1024px density for professional banner prints.
              </p>
              {qrUrl && (
                <button
                  onClick={handleDownloadQr}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/20 hover:border-accent-primary/45 text-accent-primary font-bold text-[10px] transition-colors cursor-pointer"
                >
                  Download Print PNG
                </button>
              )}
            </div>
          </div>

          {/* 3. HTML Embed Widget Snippet & Code Customizer */}
          <div className="space-y-3 border-t border-border-main/60 pt-4">
            <label className="block text-text-secondary text-[9px] font-bold uppercase tracking-wider">
              Widget Customizer & Embed Snippet
            </label>
            <p className="text-[10px] text-text-secondary leading-normal font-medium">
              Optionally override the default dashboard styling presets directly in your HTML integration code:
            </p>
            <div className="grid grid-cols-2 gap-3 bg-bg-panel-alt/40 p-3 rounded-2xl border border-border-main">
              <div>
                <label className="block text-text-secondary text-[9px] font-bold uppercase mb-1">
                  Layout Accents
                </label>
                <select
                  value={embedLayout}
                  onChange={(e) => setEmbedLayout(e.target.value)}
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-1.5 px-3 text-text-primary text-[11px] focus:outline-none focus:border-accent-primary cursor-pointer"
                >
                  <option value="" className="bg-bg-panel text-text-primary">Default (Inherit Dashboard)</option>
                  <option value="GRID" className="bg-bg-panel text-text-primary">Grid (grid)</option>
                  <option value="LIST" className="bg-bg-panel text-text-primary">List (list)</option>
                  <option value="CAROUSEL" className="bg-bg-panel text-text-primary">Carousel (carousel)</option>
                </select>
              </div>
              <div>
                <label className="block text-text-secondary text-[9px] font-bold uppercase mb-1">
                  Max Display Limit
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  min="1"
                  value={embedLimit}
                  onChange={(e) => setEmbedLimit(e.target.value)}
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-1.5 px-3 text-text-primary placeholder-text-secondary/45 text-[11px] focus:outline-none focus:border-accent-primary font-mono"
                />
              </div>
            </div>

            <div className="bg-bg-panel-alt border border-border-main rounded-xl p-3 font-mono text-[10px] text-accent-primary overflow-x-auto select-all max-h-32 mt-2">
              <pre className="whitespace-pre">{getEmbedSnippet()}</pre>
            </div>
            <button
              onClick={handleCopySnippet}
              className="w-full bg-bg-panel-alt hover:bg-bg-panel-hover border border-border-main/60 text-text-secondary hover:text-text-primary font-bold py-2 rounded-xl text-xs transition cursor-pointer"
            >
              Copy Customized Snippet
            </button>
          </div>

          {/* Close button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full bg-bg-panel-alt hover:bg-bg-panel-hover border border-border-main/60 text-text-primary font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Close Dialog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
