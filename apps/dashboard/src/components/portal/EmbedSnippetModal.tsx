"use client";

import React, { useState } from "react";

interface EmbedSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgSlug: string;
  eventSlug: string;
  eventTitle: string;
  eventId?: string;
}

export default function EmbedSnippetModal({
  isOpen,
  onClose,
  orgSlug,
  eventSlug,
  eventTitle,
  eventId,
}: EmbedSnippetModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"html" | "react" | "link">("html");

  if (!isOpen) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const htmlSnippet = `<!-- EventsPlug Embedded Registration Form (Event-Scoped) -->
<script src="${baseUrl}/widget.js" async></script>
<events-plug-widget event-id="${eventId || ''}"></events-plug-widget>`;

  const reactSnippet = `import { EventsWidget } from '@eventflow/react';

export default function RegistrationSection() {
  return (
    <EventsWidget 
      eventId="${eventId || ''}"
    />
  );
}`;

  const standaloneUrl = `${baseUrl}/e/${orgSlug}/${eventSlug}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-bg-panel border border-border-main rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border-main flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-primary font-display flex items-center gap-2">
              <span>🔌</span> Embed Form & Widget
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Embed <span className="font-semibold text-text-primary">{eventTitle}</span> on any website or share the standalone form link.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-panel-alt hover:bg-bg-panel-hover border border-border-main text-text-secondary hover:text-text-primary flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-border-main flex gap-2">
          <button
            onClick={() => setActiveTab("html")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "html"
                ? "border-accent-primary text-accent-primary bg-accent-primary/5"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            HTML / Web Component
          </button>
          <button
            onClick={() => setActiveTab("react")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "react"
                ? "border-accent-primary text-accent-primary bg-accent-primary/5"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            React / Next.js
          </button>
          <button
            onClick={() => setActiveTab("link")}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === "link"
                ? "border-accent-primary text-accent-primary bg-accent-primary/5"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Standalone Link
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 space-y-4">
          {activeTab === "html" && (
            <div>
              <p className="text-xs text-text-secondary mb-3 font-medium">
                Copy and paste this 2-line snippet into Webflow, Framer, WordPress, Squarespace, or any static HTML page.
              </p>
              <div className="relative">
                <pre className="bg-bg-panel-alt border border-border-main rounded-xl p-4 text-xs font-mono text-text-primary overflow-x-auto select-all">
                  {htmlSnippet}
                </pre>
                <button
                  onClick={() => handleCopy(htmlSnippet, "html")}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {copiedType === "html" ? "Copied! ✓" : "Copy Snippet"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "react" && (
            <div>
              <p className="text-xs text-text-secondary mb-3 font-medium">
                Import our lightweight React wrapper component for seamless Next.js and React integration.
              </p>
              <div className="relative">
                <pre className="bg-bg-panel-alt border border-border-main rounded-xl p-4 text-xs font-mono text-text-primary overflow-x-auto select-all">
                  {reactSnippet}
                </pre>
                <button
                  onClick={() => handleCopy(reactSnippet, "react")}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {copiedType === "react" ? "Copied! ✓" : "Copy Snippet"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "link" && (
            <div>
              <p className="text-xs text-text-secondary mb-3 font-medium">
                Share this direct form URL via email, Slack, or social media. No website hosting required!
              </p>
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={standaloneUrl}
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-3 text-xs font-mono text-text-primary focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(standaloneUrl, "link")}
                  className="px-4 py-3 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                >
                  {copiedType === "link" ? "Copied! ✓" : "Copy Link"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-bg-panel-alt border-t border-border-main flex items-center justify-between">
          <span className="text-[11px] text-text-secondary">
            Encapsulated in Shadow DOM · Zero style leakage on host pages
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-bg-panel hover:bg-bg-panel-hover border border-border-main text-text-primary text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
