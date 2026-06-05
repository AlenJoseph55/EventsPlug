"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import RegistrationForm from "@/components/RegistrationForm";
import { formatFriendlyDate } from "@/lib/date-utils";
import { getContrastAdjustedColor } from "@/lib/color-utils";

interface EventPageClientProps {
  event: any;
}

export default function EventPageClient({ event }: EventPageClientProps) {
  const [registeredTicket, setRegisteredTicket] = useState<any>(null);
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    // Read from the data attribute set by the blocking script in layout.tsx
    // This ensures SSR/first-paint matches what the user previously selected
    if (typeof document !== "undefined") {
      const attr = document.documentElement.getAttribute("data-hub-theme");
      if (attr === "light") return "light";
      if (attr === "dark") return "dark";
    }
    return "dark";
  });

  useEffect(() => {
    // If no blocking script attribute was set, check localStorage / system preference
    const attr = document.documentElement.getAttribute("data-hub-theme");
    if (!attr) {
      const saved = localStorage.getItem("eventsplug-hub-theme-preference");
      if (saved === "dark" || saved === "light") {
        setThemeMode(saved);
      } else {
        const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        setThemeMode(prefersLight ? "light" : "dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(newMode);
    localStorage.setItem("eventsplug-hub-theme-preference", newMode);
    const root = document.documentElement;
    root.classList.remove("light-hub", "dark-hub");
    root.classList.add(newMode === "light" ? "light-hub" : "dark-hub");
    root.setAttribute("data-hub-theme", newMode);
  };

  const selTheme = event.theme || event.organization.hubTheme || event.organization.defaultTheme || {
    cssVariables: {
      "--primary-color": "#6366f1",
      "--bg-color": "#090d16",
      "--text-color": "#f8fafc",
      "--card-bg": "#111827",
    },
  };

  const variables = (selTheme.cssVariables || {}) as Record<string, string>;
  const primaryColor = event.theme ? (variables["--primary-color"] || "#6366f1") : (event.organization.hubAccentColor || variables["--primary-color"] || "#6366f1");

  // Determine active mode colors
  const isLight = themeMode === "light";
  const bgColor = isLight ? "#f8fafc" : (event.theme ? (variables["--bg-color"] || "#090d16") : (event.organization.hubBgColor || variables["--bg-color"] || "#090d16"));

  // If a custom background is set, or theme uses default solid gray backgrounds, use an adaptive transparent overlay so card tints with bgColor
  const cardBg = isLight
    ? "rgba(255, 255, 255, 0.75)"
    : (event.theme ? (variables["--card-bg"] || "rgba(255, 255, 255, 0.045)") : (event.organization.hubBgColor || variables["--card-bg"] === "#111827" || variables["--card-bg"] === "#1e293b" || !variables["--card-bg"]
        ? "rgba(255, 255, 255, 0.045)"
        : variables["--card-bg"]));
  const textColor = isLight ? "#0f172a" : (variables["--text-color"] || "#f8fafc");

  const adjustedAccentColor = getContrastAdjustedColor(primaryColor, bgColor);

  // Capacity calculations
  const registeredCount = event._count?.registrations || 0;
  const isFull = event.maxRegistrations && registeredCount >= event.maxRegistrations;

  // Calendar Link Generator
  const buildCalendarUrl = (evt: any) => {
    try {
      const eventDate = new Date(evt.date);
      if (isNaN(eventDate.getTime())) return "#";

      const start = eventDate.toISOString().replace(/-|:|\.\d{3}/g, "");
      const end = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000)
        .toISOString()
        .replace(/-|:|\.\d{3}/g, "");

      return (
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(evt.title)}` +
        `&dates=${start}/${end}` +
        `&details=${encodeURIComponent(evt.description || "")}` +
        `&location=${encodeURIComponent(evt.location || "")}`
      );
    } catch {
      return "#";
    }
  };

  // WhatsApp Link Generator
  const buildWhatsAppUrl = (evt: any) => {
    const shareUrl = typeof window !== "undefined"
      ? window.location.href
      : `https://eventsplug.com/e/${evt.organization.slug}/${evt.slug}`;

    return `https://wa.me/?text=${encodeURIComponent(
      `🎉 I just registered for ${evt.title}!\n\nJoin me here: ${shareUrl}`
    )}`;
  };

  return (
    <main
      style={{
        backgroundColor: bgColor,
        color: textColor,
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
      className="min-h-screen relative overflow-hidden px-4 py-8 md:py-16 font-sans transition-colors duration-300"
    >
      {/* Dynamic Keyframe Animations */}
      <style jsx global>{`
        @keyframes spotlight-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1) translate(0, 0); opacity: 0.12; }
          50% { transform: translate(-50%, -50%) scale(1.15) translate(40px, -20px); opacity: 0.16; }
        }
        @keyframes aurora-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
      `}</style>

      {/* Floating Dark/Light Toggle Switch */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark/light mode"
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center p-3.5 rounded-full shadow-2xl border transition-all duration-300 hover:scale-105 active:scale-95 ${
          isLight
            ? "bg-white/95 text-slate-800 border-slate-200 hover:bg-slate-50"
            : "bg-slate-900/90 text-amber-400 border-slate-800 hover:bg-slate-850"
        }`}
      >
        <span className="text-base select-none leading-none">
          {isLight ? "🌙" : "☀️"}
        </span>
      </button>

      {/* Dynamic backdrop selector */}
      {(() => {
        const themeStyle = event.organization.hubThemeStyle || "DOT_MATRIX";
        const gridLineColor = isLight ? "0, 0, 0" : "255, 255, 255";
        const gridOpacity = isLight ? "0.04" : "0.035";

        if (themeStyle === "GRID_WARP") {
          return (
            <>
              <div
                style={{
                  backgroundColor: adjustedAccentColor,
                  animation: 'spotlight-pulse 16s infinite ease-in-out',
                }}
                className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[130px] pointer-events-none transition-all duration-500 ${
                  isLight ? "opacity-[0.08]" : "opacity-[0.14]"
                }`}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(${gridLineColor}, ${gridOpacity}) 1px, transparent 1px), linear-gradient(to bottom, rgba(${gridLineColor}, ${gridOpacity}) 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                  transition: 'background-image 0.3s ease',
                }}
              />
            </>
          );
        }
        if (themeStyle === "AURORA_GLOW") {
          return (
            <>
              <div
                style={{
                  backgroundColor: adjustedAccentColor,
                  animation: 'aurora-drift 22s infinite ease-in-out',
                }}
                className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-all duration-500 ${
                  isLight ? "opacity-[0.04]" : "opacity-[0.06]"
                }`}
              />
              <div
                style={{
                  backgroundColor: '#ec4899',
                  animation: 'aurora-drift 28s infinite ease-in-out reverse',
                }}
                className={`absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 ${
                  isLight ? "opacity-[0.03]" : "opacity-[0.05]"
                }`}
              />
            </>
          );
        }
        // Default DOT_MATRIX
        return (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(${gridLineColor}, ${gridOpacity}) 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
              transition: 'background-image 0.3s ease',
            }}
          />
        );
      })()}

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Hub Back link header */}
        <div className={`pb-4 border-b mb-4 ${isLight ? "border-slate-200" : "border-white/[0.04]"}`}>
          <Link
            href={`/o/${event.organization.slug}`}
            className={`inline-flex items-center gap-2 text-xs font-bold transition-colors group whitespace-nowrap ${
              isLight ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="transform group-hover:translate-x-[-2px] transition-transform duration-200">←</span>
            <span>Back to {event.organization.name}</span>
          </Link>
        </div>

        {/* Double column container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left details panel: 7-span */}
          <div className="md:col-span-7 space-y-6">
            {/* Event poster/cover card */}
            <div
              style={{
                backgroundColor: cardBg,
                borderColor: isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)",
              }}
              className="rounded-3xl border overflow-hidden shadow-2xl relative"
            >
              {event.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.posterUrl}
                  alt={event.title}
                  className="w-full h-auto max-h-[340px] object-cover"
                />
              ) : (
                <div
                  style={{
                    background: `linear-gradient(135deg, ${adjustedAccentColor}20, ${adjustedAccentColor}40)`,
                  }}
                  className="w-full h-[180px] flex items-center justify-center relative overflow-hidden"
                >
                  <div
                    style={{ backgroundColor: adjustedAccentColor }}
                    className="absolute w-[200px] h-[200px] rounded-full blur-3xl opacity-30 animate-pulse"
                  />
                  <span className="text-xl font-black uppercase tracking-widest opacity-40 text-center px-6">
                    {event.title}
                  </span>
                </div>
              )}
            </div>

            {/* Event Meta Information Card */}
            <div
              style={{
                backgroundColor: cardBg,
                borderColor: isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)",
              }}
              className="rounded-3xl border p-6 space-y-6 shadow-xl"
            >
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                  {event.title}
                </h1>
                <p className="text-xs font-bold opacity-75">
                  Organized by <strong className="text-current font-extrabold">{event.organization.name}</strong>
                </p>
              </div>

              {/* Grid cards info details */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 border-y py-4 ${isLight ? "border-slate-200" : "border-white/5"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow ${
                    isLight ? "bg-slate-100 border border-slate-200 text-slate-800" : "bg-white/5 border border-white/5 shadow-white/5"
                  }`}>
                    📅
                  </div>
                  <div className="text-[11px]">
                    <div className="font-extrabold uppercase opacity-65 tracking-wide">Date & Time</div>
                    <div className="font-bold">{formatFriendlyDate(event.date)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shadow ${
                    isLight ? "bg-slate-100 border border-slate-200 text-slate-800" : "bg-white/5 border border-white/5 shadow-white/5"
                  }`}>
                    📍
                  </div>
                  <div className="text-[11px]">
                    <div className="font-extrabold uppercase opacity-65 tracking-wide">Location</div>
                    <div className="font-bold">{event.location}</div>
                  </div>
                </div>
              </div>

              {/* Progress counter for seat booking */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-bold opacity-75">
                  <span>Capacity Details</span>
                  <span>
                    {isFull
                      ? "Sold Out 🚫"
                      : `${registeredCount} / ${event.maxRegistrations || "Unlimited"} Seats`}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden border ${
                  isLight ? "bg-slate-100 border-slate-200/60" : "bg-black/40 border-white/5"
                }`}>
                  <div
                    style={{
                      width: event.maxRegistrations
                        ? `${Math.min((registeredCount / event.maxRegistrations) * 100, 100)}%`
                        : "5%",
                      backgroundColor: isFull ? "#ef4444" : adjustedAccentColor,
                    }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Main about description text */}
              <div className={`space-y-2.5 border-t pt-4 ${isLight ? "border-slate-200" : "border-white/5"}`}>
                <h4 className="text-xs font-black uppercase tracking-widest opacity-65">About this Event</h4>
                <p className="text-xs leading-relaxed opacity-85 font-medium whitespace-pre-wrap">
                  {event.description || "No description provided for this event."}
                </p>
              </div>
            </div>
          </div>

          {/* Right interactive registration card: 5-span */}
          <div className="md:col-span-5">
            <div
              style={{
                backgroundColor: cardBg,
                borderColor: isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)",
              }}
              className="rounded-3xl border p-6 shadow-2xl space-y-4"
            >
              <div className={`space-y-1 pb-3 border-b ${isLight ? "border-slate-200" : "border-white/5"}`}>
                <h3 className="text-sm font-extrabold uppercase tracking-widest opacity-65">
                  Registration
                </h3>
                <p className="text-[11px] font-bold leading-normal opacity-65">
                  Secure your seat instantly. Registration is 100% free.
                </p>
              </div>

              {isFull ? (
                <div className="p-6 rounded-2xl bg-red-950/20 border border-red-900/50 text-center space-y-3">
                  <span className="text-3xl block animate-bounce">🚫</span>
                  <h4 className="text-xs font-black text-red-400 uppercase tracking-widest">
                    Registration Closed
                  </h4>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    This event is fully booked! Capacity limits have been reached and registrations are closed.
                  </p> 
                </div>
              ) : (
                <RegistrationForm
                  event={event}
                  preview={false}
                  onSubmitSuccess={(ticket) => setRegisteredTicket(ticket)}
                  primaryColor={adjustedAccentColor}
                  cardBg={cardBg}
                  textColor={textColor}
                />
              )}
            </div>
          </div>
        </div>

        {/* Centered Brand Watermark Footer */}
        <div className={`text-center pt-8 pb-2 opacity-30 select-none ${isLight ? "text-slate-600" : "text-slate-400"}`}>
          <span className="text-[10px] font-mono tracking-wider uppercase">
            Powered by <strong className={`font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>EventsPlug</strong>
          </span>
        </div>
      </div>

      {/* Ticket Success Confirmation Modal Dialog */}
      {registeredTicket && (
        <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 ${
          isLight ? "bg-slate-900/50" : "bg-[#06080f]/80"
        }`}>
          <div
            style={{
              backgroundColor: cardBg,
              borderColor: isLight ? "rgba(15, 23, 42, 0.15)" : "rgba(255, 255, 255, 0.1)",
            }}
            className="rounded-3xl border p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Glowing accent border */}
            <div
              style={{ backgroundColor: adjustedAccentColor }}
              className="absolute top-0 left-0 right-0 h-1.5"
            />

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-2xl shadow shadow-emerald-500/5 animate-pulse">
              ✓
            </div>

            <div className="space-y-2">
              <h2 className={`text-lg font-black tracking-tight uppercase ${isLight ? "text-slate-900" : "text-white"}`}>Registration Confirmed!</h2>
              <p className="text-xs leading-relaxed font-medium opacity-75">
                You are registered for <strong className="text-current font-black">{event.title}</strong>.<br />
                A confirmation has been logged to our registers.
              </p>
            </div>

            {/* Universal Actions Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={buildCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-extrabold text-[10px] uppercase border transition-colors ${
                  isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200" : "bg-white/5 hover:bg-white/10 text-white border-white/5"
                }`}
              >
                📅 Calendar
              </a>
              <a
                href={buildWhatsAppUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: `${adjustedAccentColor}15`,
                  color: adjustedAccentColor,
                  borderColor: `${adjustedAccentColor}30`,
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border font-extrabold text-[10px] uppercase transition-colors hover:opacity-90"
              >
                🟢 Share
              </a>
            </div>

            <button
              onClick={() => {
                setRegisteredTicket(null);
                // Force a page refresh to update capacity counters in background
                if (typeof window !== "undefined") window.location.reload();
              }}
              style={{ backgroundColor: adjustedAccentColor }}
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-extrabold text-xs shadow-lg hover:opacity-95 active:scale-[0.98] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
