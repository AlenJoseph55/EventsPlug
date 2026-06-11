"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import RegistrationForm from "@/components/RegistrationForm";
import { formatFriendlyDate } from "@/lib/date-utils";
import { deriveThemeVariables } from "@/lib/color-utils";
import dynamic from "next/dynamic";

const AuroraBg = dynamic(() => import("@/components/ui/backgrounds/Aurora"), { ssr: false });
const GradientBg = dynamic(() => import("@/components/ui/backgrounds/Gradient"), { ssr: false });
const ShapegridBg = dynamic(() => import("@/components/ui/backgrounds/Shapegrid"), { ssr: false });
const PixelsnowBg = dynamic(() => import("@/components/ui/backgrounds/Pixelsnow"), { ssr: false });
const LightfallBg = dynamic(() => import("@/components/ui/backgrounds/Lightfall"), { ssr: false });
const SideraysBg = dynamic(() => import("@/components/ui/backgrounds/Siderays"), { ssr: false });
const LightraysBg = dynamic(() => import("@/components/ui/backgrounds/Lightrays"), { ssr: false });

interface EventPageClientProps {
  event: any;
}

export default function EventPageClient({ event }: EventPageClientProps) {
  const [registeredTicket, setRegisteredTicket] = useState<any>(null);

  // Resolve base CSS themes from organization settings (with event override theme)
  const selTheme = event.theme || event.organization.hubTheme || event.organization.defaultTheme || {
    baseMode: "auto",
    accentHue: 250,
    accentChroma: 0.18,
    surfaceTone: "mid",
    skinId: "frosted",
    fontPairingId: "inter-inter",
  };

  // If semantic columns are null/undefined but cssVariables exists (legacy record during migration)
  // we fallback to system default to prevent crashes
  const isThemeLegacy = selTheme.accentHue === undefined || selTheme.accentHue === null;
  const finalTheme = isThemeLegacy
    ? {
        baseMode: "auto",
        accentHue: 250,
        accentChroma: 0.18,
        surfaceTone: "mid",
        skinId: "frosted",
        fontPairingId: "inter-inter",
      }
    : selTheme;

  // Resolve skin: event.skin (if overridden) or fall back to organization settings
  const selSkin = event.skin || event.organization.hubSkin || event.organization.defaultSkin || {
    borderRadius: "16px",
    borderStyle: "solid",
    borderWidth: "1px",
    shadowStyle: "frosted",
    fontFamily: "var(--font-sans)",
    backdropStyle: "AURORA_GLOW",
  };

  const serverMode = finalTheme.baseMode === "light" ? "light" : "dark";
  const [themeMode, setThemeMode] = useState<"dark" | "light">(serverMode);

  useEffect(() => {
    const root = document.documentElement;
    const attr = root.getAttribute("data-hub-theme");
    const saved = localStorage.getItem("eventsplug-hub-theme-preference");
    
    const mode = (attr === "light" || attr === "dark")
      ? attr
      : (saved === "light" || saved === "dark")
      ? saved
      : finalTheme.baseMode === "light"
      ? "light"
      : "dark";

    setThemeMode(mode);

    // Sync HTML class and attribute
    if (!root.classList.contains("light-hub") && !root.classList.contains("dark-hub")) {
      root.classList.add(mode === "light" ? "light-hub" : "dark-hub");
      root.setAttribute("data-hub-theme", mode);
    }
  }, [finalTheme.baseMode]);

  const toggleTheme = () => {
    const newMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(newMode);
    localStorage.setItem("eventsplug-hub-theme-preference", newMode);
    const root = document.documentElement;
    root.classList.remove("light-hub", "dark-hub");
    root.classList.add(newMode === "light" ? "light-hub" : "dark-hub");
    root.setAttribute("data-hub-theme", newMode);
  };

  const derived = deriveThemeVariables(finalTheme, themeMode);

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
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
      className="min-h-screen relative overflow-hidden px-4 py-8 md:py-16 hub-bg"
    >
      {/* Dynamic Keyframe Animations & Hub CSS Variables */}
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

        :root {
          --hub-bg-color: ${derived.bgColor};
          --hub-text-color: ${derived.textColor};
          --hub-card-bg: ${derived.cardBg};
          --hub-card-border: ${derived.cardBorder};
          --hub-accent-color: ${derived.primaryColor};
          --hub-grid-line-color: ${derived.gridLineColor};
          --hub-grid-opacity: ${derived.gridOpacity};
          --hub-spotlight-opacity: ${themeMode === "light" ? "0.08" : "0.14"};
          --hub-aurora-accent-opacity: ${themeMode === "light" ? "0.04" : "0.06"};
          --hub-aurora-pink-opacity: ${themeMode === "light" ? "0.03" : "0.05"};

          --hub-cover-bg: ${themeMode === "light" ? "linear-gradient(135deg, #f1f5f9, rgba(226, 232, 240, 0.5))" : "linear-gradient(135deg, rgba(255, 255, 255, 0.015), rgba(255, 255, 255, 0.005))"};
          --hub-cover-border: ${derived.cardBorder};
          --hub-muted-title: ${themeMode === "light" ? "#94a3b8" : "#475569"};
          --hub-muted-text: ${derived.textSecondary};
          --hub-border-color: ${derived.cardBorder};
          
          --hub-logo-bg: ${themeMode === "light" ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)"};
          --hub-title-color: ${derived.textColor};
          --hub-poster-text: ${derived.textSecondary};
          --hub-bar-bg: ${themeMode === "light" ? "#e2e8f0" : "rgba(0, 0, 0, 0.4)"};
          
          --hub-soldout-btn-bg: ${themeMode === "light" ? "#f1f5f9" : "rgba(255, 255, 255, 0.05)"};
          --hub-soldout-btn-border: ${derived.cardBorder};
          --hub-soldout-btn-text: ${derived.textSecondary};
          
          --hub-footer-strong-color: ${derived.textSecondary};
          
          --hub-theme-toggle-bg: ${themeMode === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 23, 42, 0.9)"};
          --hub-theme-toggle-border: ${derived.cardBorder};
          --hub-theme-toggle-text: ${themeMode === "light" ? "#1e293b" : "#fbbf24"};
          --hub-theme-toggle-hover: ${themeMode === "light" ? "#f8fafc" : "rgba(30, 41, 59, 0.9)"};

          --hub-banner-overlay-bg: ${themeMode === "light" ? "linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%)" : "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)"};

          /* Structural skin tokens */
          --hub-border-radius: ${derived.radiusCard};
          --hub-border-style: solid;
          --hub-border-width: ${derived.cardBorder === 'none' ? '0px' : '1px'};
          --hub-font-family: var(--hub-font-body);
          --hub-font-display: ${derived.fontDisplay};
          --hub-font-body: ${derived.fontBody};
          --hub-box-shadow: ${derived.shadowCard};
        }

        .hub-bg {
          background-color: var(--hub-bg-color);
          color: var(--hub-text-color);
          font-family: var(--hub-font-family);
        }
        .hub-card {
          background-color: var(--hub-card-bg);
          border-width: var(--hub-border-width);
          border-style: var(--hub-border-style);
          border-color: var(--hub-card-border);
          border-radius: var(--hub-border-radius);
          box-shadow: var(--hub-box-shadow);
        }
        .hub-card-cover {
          background: var(--hub-cover-bg);
          border-color: var(--hub-cover-border);
        }
        .hub-border {
          border-color: var(--hub-border-color);
        }
        .hub-logo-img, .hub-icon-container {
          background-color: var(--hub-logo-bg);
          border-color: var(--hub-border-color);
        }
        .hub-icon-container {
          color: var(--hub-text-color);
        }
        .hub-title {
          color: var(--hub-title-color);
          font-family: var(--hub-font-display);
        }
        .hub-muted-title {
          color: var(--hub-muted-title);
        }
        .hub-muted-text {
          color: var(--hub-muted-text);
        }
        .hub-poster-placeholder-text {
          color: var(--hub-poster-text);
        }
        .hub-bar-container {
          background-color: var(--hub-bar-bg);
          border-color: var(--hub-border-color);
        }
        .hub-btn-primary {
          background-color: var(--hub-accent-color);
          color: #ffffff !important;
          box-shadow: 0 4px 14px -4px var(--hub-accent-color);
        }
        .hub-btn-soldout {
          background-color: var(--hub-soldout-btn-bg);
          border-color: var(--hub-soldout-btn-border);
          color: var(--hub-soldout-btn-text);
        }
        .hub-footer-strong {
          color: var(--hub-footer-strong-color);
        }

        .hub-theme-toggle {
          background-color: var(--hub-theme-toggle-bg);
          border-color: var(--hub-theme-toggle-border);
          color: var(--hub-theme-toggle-text);
        }
        .hub-theme-toggle:hover {
          background-color: var(--hub-theme-toggle-hover);
        }

        /* Backdrop Grid/Matrix Styling */
        .hub-spotlight {
          opacity: var(--hub-spotlight-opacity);
        }
        .hub-grid-warp-mesh {
          background-image: linear-gradient(to right, rgba(var(--hub-grid-line-color), var(--hub-grid-opacity)) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--hub-grid-line-color), var(--hub-grid-opacity)) 1px, transparent 1px);
        }
        .hub-aurora-accent {
          opacity: var(--hub-aurora-accent-opacity);
        }
        .hub-aurora-pink {
          opacity: var(--hub-aurora-pink-opacity);
        }
        .hub-dot-matrix {
          background-image: radial-gradient(rgba(var(--hub-grid-line-color), var(--hub-grid-opacity)) 1px, transparent 1px);
        }

        /* Toggle Button Icon Visibility */
        html.dark-hub .hub-theme-sun { display: inline; }
        html.dark-hub .hub-theme-moon { display: none; }
        
        html.light-hub .hub-theme-sun { display: none; }
        html.light-hub .hub-theme-moon { display: inline; }
      `}</style>

      {/* Floating Dark/Light Toggle Switch */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle dark/light mode"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-3.5 rounded-full shadow-2xl border transition-all duration-300 hover:scale-105 active:scale-95 hub-theme-toggle"
      >
        <span className="text-base select-none leading-none flex items-center justify-center">
          <span className="hub-theme-sun">☀️</span>
          <span className="hub-theme-moon">🌙</span>
        </span>
      </button>

      {/* Dynamic backdrop selector */}
      {(() => {
        const themeStyle = event.organization.hubThemeStyle || selSkin.backdropStyle || "DOT_MATRIX";

        switch (themeStyle) {
          case "GRID_WARP":
            return (
              <>
                <div
                  style={{
                    backgroundColor: "var(--hub-accent-color)",
                    animation: 'spotlight-pulse 16s infinite ease-in-out',
                  }}
                  className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[130px] pointer-events-none transition-all duration-500 hub-spotlight"
                />
                <div
                  className="absolute inset-0 pointer-events-none hub-grid-warp-mesh"
                  style={{
                    backgroundSize: '16px 16px',
                    transition: 'background-image 0.3s ease',
                  }}
                />
              </>
            );
          case "AURORA_GLOW":
            return (
              <>
                <div
                  style={{
                    backgroundColor: "var(--hub-accent-color)",
                    animation: 'aurora-drift 22s infinite ease-in-out',
                  }}
                  className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-all duration-500 hub-aurora-accent"
                />
                <div
                  style={{
                    backgroundColor: '#ec4899',
                    animation: 'aurora-drift 28s infinite ease-in-out reverse',
                  }}
                  className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 hub-aurora-pink"
                />
              </>
            );
          case "AURORA":
            return <AuroraBg />;
          case "GRADIENT":
            return <GradientBg />;
          case "SHAPEGRID":
            return <ShapegridBg />;
          case "PIXELSNOW":
            return <PixelsnowBg />;
          case "LIGHTFALL":
            return <LightfallBg />;
          case "SIDERAYS":
            return <SideraysBg />;
          case "LIGHTRAYS":
            return <LightraysBg />;
          case "DOT_MATRIX":
          default:
            return (
              <div
                className="absolute inset-0 pointer-events-none hub-dot-matrix"
                style={{
                  backgroundSize: '12px 12px',
                  transition: 'background-image 0.3s ease',
                }}
              />
            );
        }
      })()}

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Hub Back link header */}
        <div className="pb-4 border-b mb-4 hub-border">
          <Link
            href={`/o/${event.organization.slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold transition-colors group whitespace-nowrap hub-muted-text hover:opacity-90"
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
            <div className="overflow-hidden relative hub-card">
              {event.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.posterUrl}
                  alt={event.title}
                  className="w-full h-auto max-h-[340px] object-cover"
                />
              ) : (
                <div className="w-full h-[180px] flex items-center justify-center relative overflow-hidden hub-card-cover">
                  <div
                    style={{ backgroundColor: "var(--hub-accent-color)" }}
                    className="absolute w-[200px] h-[200px] rounded-full blur-3xl opacity-30 animate-pulse"
                  />
                  <span className="text-xl font-black uppercase tracking-widest opacity-40 text-center px-6 hub-poster-placeholder-text">
                    {event.title}
                  </span>
                </div>
              )}
            </div>

            {/* Event Meta Information Card */}
            <div className="p-6 space-y-6 hub-card">
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                  {event.title}
                </h1>
                <p className="text-xs font-bold opacity-75">
                  Organized by <strong className="text-current font-extrabold">{event.organization.name}</strong>
                </p>
              </div>

              {/* Grid cards info details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y py-4 hub-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border flex items-center justify-center text-sm shadow hub-icon-container hub-border">
                    📅
                  </div>
                  <div className="text-[11px]">
                    <div className="font-extrabold uppercase tracking-wide hub-muted-title">Date & Time</div>
                    <div className="font-bold">{formatFriendlyDate(event.date)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl border flex items-center justify-center text-sm shadow hub-icon-container hub-border">
                    📍
                  </div>
                  <div className="text-[11px]">
                    <div className="font-extrabold uppercase tracking-wide hub-muted-title">Location</div>
                    <div className="font-bold">{event.location}</div>
                  </div>
                </div>
              </div>

              {/* Progress counter for seat booking */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-bold hub-muted-text">
                  <span>Capacity Details</span>
                  <span>
                    {isFull
                      ? "Sold Out 🚫"
                      : `${registeredCount} / ${event.maxRegistrations || "Unlimited"} Seats`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden border hub-bar-container">
                  <div
                    style={{
                      width: event.maxRegistrations
                        ? `${Math.min((registeredCount / event.maxRegistrations) * 100, 100)}%`
                        : "5%",
                      backgroundColor: isFull ? "#ef4444" : "var(--hub-accent-color)",
                    }}
                    className="h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Main about description text */}
              <div className="space-y-2.5 border-t pt-4 hub-border">
                <h4 className="text-xs font-black uppercase tracking-widest hub-muted-title">About this Event</h4>
                <p className="text-xs leading-relaxed opacity-85 font-medium whitespace-pre-wrap">
                  {event.description || "No description provided for this event."}
                </p>
              </div>
            </div>
          </div>

          {/* Right interactive registration card: 5-span */}
          <div className="md:col-span-5">
            <div className="p-6 shadow-2xl space-y-4 hub-card">
              <div className="space-y-1 pb-3 border-b hub-border">
                <h3 className="text-sm font-extrabold uppercase tracking-widest hub-muted-title">
                  Registration
                </h3>
                <p className="text-[11px] font-bold leading-normal hub-muted-text">
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
                  primaryColor={derived.primaryColor}
                  cardBg={derived.cardBg}
                  textColor={derived.textColor}
                />
              )}
            </div>
          </div>
        </div>

        {/* Centered Brand Watermark Footer */}
        <div className="text-center pt-8 pb-2 hub-muted-text select-none">
          <span className="text-[10px] font-mono tracking-wider uppercase">
            Powered by <strong className="font-extrabold hub-footer-strong">EventsPlug</strong>
          </span>
        </div>
      </div>

      {/* Ticket Success Confirmation Modal Dialog */}
      {registeredTicket && (
        <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 bg-black/60">
          <div className="p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 hub-card">
            {/* Glowing accent border */}
            <div
              style={{ backgroundColor: "var(--hub-accent-color)" }}
              className="absolute top-0 left-0 right-0 h-1.5"
            />

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-2xl shadow shadow-emerald-500/5 animate-pulse">
              ✓
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black tracking-tight uppercase">Registration Confirmed!</h2>
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
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-extrabold text-[10px] uppercase border transition-colors hub-theme-toggle"
              >
                📅 Calendar
              </a>
              <a
                href={buildWhatsAppUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: `${derived.primaryColor}15`,
                  color: derived.primaryColor,
                  borderColor: `${derived.primaryColor}30`,
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
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-extrabold text-xs transition-all hub-btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
