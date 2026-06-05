"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatFriendlyDate } from "@/lib/date-utils";
import { getContrastAdjustedColor } from "@/lib/color-utils";

interface HubEvent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  posterUrl?: string;
  maxRegistrations?: number;
  autoFitImage?: boolean | null;
  _count?: {
    registrations: number;
  };
}

interface PublicHubClientProps {
  organization: {
    name: string;
    slug: string;
    hubTitle?: string;
    hubDescription?: string;
    hubLogoUrl?: string;
    hubIcon?: string;
    hubBannerUrl?: string;
    hubThemeStyle?: string;
    hubTheme?: {
      cssVariables?: Record<string, string>;
    };
    defaultTheme?: {
      cssVariables?: Record<string, string>;
    };
    hubAccentColor?: string;
    hubBgColor?: string;
    hubLayout?: "GRID" | "LIST" | "CAROUSEL";
    autoFitImages?: boolean;
    showCardDate?: boolean;
    showCardLocation?: boolean;
    showCardCapacity?: boolean;
  };
  events: HubEvent[];
}

export default function PublicHubClient({ organization, events }: PublicHubClientProps) {
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    if (typeof document !== "undefined") {
      const attr = document.documentElement.getAttribute("data-hub-theme");
      if (attr === "light") return "light";
      if (attr === "dark") return "dark";
    }
    return "dark";
  });

  useEffect(() => {
    // Ensure the hub class is present (the blocking script in layout.tsx should
    // have already added it, but this is a safety net for edge cases)
    const root = document.documentElement;
    if (!root.classList.contains("light-hub") && !root.classList.contains("dark-hub")) {
      const saved = localStorage.getItem("eventsplug-hub-theme-preference");
      const mode = saved === "light" ? "light" : "dark";
      setThemeMode(mode);
      root.classList.add(mode === "light" ? "light-hub" : "dark-hub");
      root.setAttribute("data-hub-theme", mode);
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

  // Resolve base CSS themes from organization settings
  const selTheme = organization.hubTheme || organization.defaultTheme || {
    cssVariables: {
      "--primary-color": "#3b82f6",
      "--bg-color": "#090d16",
      "--text-color": "#f8fafc",
      "--card-bg": "#111827",
    },
  };

  const variables = (selTheme.cssVariables || {}) as Record<string, string>;
  const primaryColor = organization.hubAccentColor || variables["--primary-color"] || "#3b82f6";

  // Calculate Dark Mode Colors
  const darkBg = organization.hubBgColor || variables["--bg-color"] || "#090d16";
  const darkCardBg = organization.hubBgColor || variables["--card-bg"] === "#111827" || variables["--card-bg"] === "#1e293b" || !variables["--card-bg"]
    ? "rgba(255, 255, 255, 0.045)"
    : variables["--card-bg"];
  const darkTextColor = variables["--text-color"] || "#f8fafc";
  const darkAccentColor = getContrastAdjustedColor(primaryColor, darkBg);

  // Calculate Light Mode Colors
  const lightBg = "#f8fafc";
  const lightCardBg = "rgba(255, 255, 255, 0.75)";
  const lightTextColor = "#0f172a";
  const lightAccentColor = getContrastAdjustedColor(primaryColor, lightBg);

  return (
    <main
      className="min-h-screen relative overflow-hidden font-sans pb-16 hub-bg"
      style={{
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
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

        :root, html.dark-hub {
          --hub-bg-color: ${darkBg};
          --hub-text-color: ${darkTextColor};
          --hub-card-bg: ${darkCardBg};
          --hub-card-border: rgba(248, 250, 252, 0.08);
          --hub-accent-color: ${darkAccentColor};
          --hub-grid-line-color: 255, 255, 255;
          --hub-grid-opacity: 0.035;
          --hub-spotlight-opacity: 0.14;
          --hub-aurora-accent-opacity: 0.06;
          --hub-aurora-pink-opacity: 0.05;

          --hub-cover-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.015), rgba(255, 255, 255, 0.005));
          --hub-cover-border: rgba(248, 250, 252, 0.08);
          --hub-muted-title: #475569;
          --hub-muted-text: #94a3b8;
          --hub-border-color: rgba(248, 250, 252, 0.08);
          
          --hub-logo-bg: rgba(255, 255, 255, 0.05);
          --hub-title-color: #ffffff;
          --hub-poster-text: #cbd5e1;
          --hub-bar-bg: rgba(0, 0, 0, 0.4);
          
          --hub-soldout-btn-bg: rgba(255, 255, 255, 0.05);
          --hub-soldout-btn-border: rgba(255, 255, 255, 0.05);
          --hub-soldout-btn-text: #64748b;
          
          --hub-footer-strong-color: #cbd5e1;
          
          --hub-theme-toggle-bg: rgba(15, 23, 42, 0.9);
          --hub-theme-toggle-border: rgba(255, 255, 255, 0.08);
          --hub-theme-toggle-text: #fbbf24;
          --hub-theme-toggle-hover: rgba(30, 41, 59, 0.9);

          --hub-banner-overlay-bg: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%);
        }

        html.light-hub {
          --hub-bg-color: ${lightBg};
          --hub-text-color: ${lightTextColor};
          --hub-card-bg: ${lightCardBg};
          --hub-card-border: rgba(15, 23, 42, 0.08);
          --hub-accent-color: ${lightAccentColor};
          --hub-grid-line-color: 0, 0, 0;
          --hub-grid-opacity: 0.04;
          --hub-spotlight-opacity: 0.08;
          --hub-aurora-accent-opacity: 0.04;
          --hub-aurora-pink-opacity: 0.03;

          --hub-cover-bg: linear-gradient(135deg, #f1f5f9, rgba(226, 232, 240, 0.5));
          --hub-cover-border: rgba(15, 23, 42, 0.08);
          --hub-muted-title: #94a3b8;
          --hub-muted-text: #475569;
          --hub-border-color: rgba(15, 23, 42, 0.08);
          
          --hub-logo-bg: #f1f5f9;
          --hub-title-color: #0f172a;
          --hub-poster-text: #475569;
          --hub-bar-bg: #e2e8f0;
          
          --hub-soldout-btn-bg: #f1f5f9;
          --hub-soldout-btn-border: #cbd5e1;
          --hub-soldout-btn-text: #94a3b8;
          
          --hub-footer-strong-color: #475569;
          
          --hub-theme-toggle-bg: rgba(255, 255, 255, 0.95);
          --hub-theme-toggle-border: rgba(15, 23, 42, 0.08);
          --hub-theme-toggle-text: #1e293b;
          --hub-theme-toggle-hover: #f8fafc;

          --hub-banner-overlay-bg: linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.3) 100%);
        }

        .hub-bg {
          background-color: var(--hub-bg-color);
          color: var(--hub-text-color);
        }
        .hub-card {
          background-color: var(--hub-card-bg);
          border-color: var(--hub-card-border);
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

        .hub-banner-overlay {
          background-image: var(--hub-banner-overlay-bg);
        }

        /* Toggle Button Icon Visibility */
        html.dark-hub .hub-theme-sun { display: inline; }
        html.dark-hub .hub-theme-moon { display: none; }
        
        html.light-hub .hub-theme-sun { display: none; }
        html.light-hub .hub-theme-moon { display: inline; }
      `}</style>

      {/* Dynamic backdrop selector */}
      {(() => {
        const themeStyle = organization.hubThemeStyle || "DOT_MATRIX";

        if (themeStyle === "GRID_WARP") {
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
        }
        if (themeStyle === "AURORA_GLOW") {
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
        }
        // Default DOT_MATRIX
        return (
          <div
            className="absolute inset-0 pointer-events-none hub-dot-matrix"
            style={{
              backgroundSize: '12px 12px',
              transition: 'background-image 0.3s ease',
            }}
          />
        );
      })()}

      {organization.hubBannerUrl && (
        <div className="w-full h-48 md:h-64 relative overflow-hidden border-b shadow-inner hub-border">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${organization.hubBannerUrl})` }}
          />
          <div className="absolute inset-0 hub-banner-overlay" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 space-y-12 relative z-10">
        {/* Org Hub directory header */}
        <div className="text-center space-y-4 max-w-xl mx-auto hub-header">
          {organization.hubLogoUrl ? (
            <img
              src={organization.hubLogoUrl}
              alt={organization.hubTitle || organization.name}
              className="mx-auto block h-16 w-auto object-contain rounded-2xl p-1 border shadow-lg hub-logo-img"
            />
          ) : (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl text-xl shadow hub-icon-container">
              {organization.hubIcon || "🏫"}
            </div>
          )}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black tracking-tight leading-none uppercase hub-title">
              {organization.hubTitle || organization.name}
            </h1>
            <p className="text-xs font-bold opacity-65">
              Official Hub • {events.length} Active {events.length === 1 ? "Event" : "Events"}
            </p>
          </div>
          <p className="text-xs leading-relaxed font-semibold hub-description opacity-75">
            {organization.hubDescription || "Welcome to our hub registry. Click on any active listing deck below to register for upcoming sessions and matches."}
          </p>
        </div>

        {events.length === 0 ? (
          /* Empty listing state card */
          <div
            className="rounded-3xl border p-12 text-center max-w-md mx-auto space-y-4 shadow-xl hub-card"
          >
            <span className="text-3xl block">📭</span>
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-wide hub-muted-title">
                No Active Events
              </h4>
              <p className="text-xs font-semibold leading-relaxed hub-muted-text">
                There are no upcoming events listed on this organization hub currently. Check back later!
              </p>
            </div>
          </div>
        ) : (
          /* Layout Switcher */
          <div className="space-y-6">
            {organization.hubLayout === "GRID" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 hub-grid">
                {events.map((evt: HubEvent) => {
                  const regCount = evt._count?.registrations || 0;
                  const isSoldOut = evt.maxRegistrations && regCount >= evt.maxRegistrations;
                  const shouldAutoFit = evt.autoFitImage !== null ? evt.autoFitImage : organization.autoFitImages;

                  return (
                    <div
                      key={evt.id}
                      className="rounded-3xl border p-5 shadow-lg flex flex-col justify-between space-y-5 relative overflow-hidden hub-card"
                    >
                      {/* Gradient card top cover placeholder */}
                      <div className={`rounded-2xl border flex items-center justify-center relative overflow-hidden flex-shrink-0 hub-card-cover ${
                        shouldAutoFit ? 'h-auto' : 'h-28'
                      }`}>
                        {evt.posterUrl ? (
                          <img
                            src={evt.posterUrl}
                            alt={evt.title}
                            className={shouldAutoFit ? "relative w-full h-auto object-contain" : "absolute inset-0 w-full h-full object-cover"}
                          />
                        ) : (
                          <>
                            <div
                              style={{ backgroundColor: "var(--hub-accent-color)" }}
                              className="absolute w-24 h-24 rounded-full blur-2xl opacity-25"
                            />
                            <span className="text-center px-4 font-black uppercase tracking-wider text-[10px] z-10 truncate max-w-full hub-poster-placeholder-text">
                              {evt.title}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <h4 className="text-sm font-black line-clamp-1">{evt.title}</h4>
                        <p className="text-[10px] line-clamp-2 leading-relaxed font-semibold opacity-75">
                          {evt.description}
                        </p>
                      </div>

                      {(organization.showCardDate !== false || organization.showCardLocation !== false) && (
                        <div className="text-[9px] space-y-1 font-bold opacity-65">
                          {organization.showCardDate !== false && <div>📅 {formatFriendlyDate(evt.date)}</div>}
                          {organization.showCardLocation !== false && <div>📍 {evt.location}</div>}
                        </div>
                      )}

                      <div className="space-y-3.5 pt-3 border-t hub-border">
                        {organization.showCardCapacity !== false && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-extrabold opacity-65">
                              <span>Capacity status</span>
                              <span>
                                {isSoldOut ? "Sold Out 🚫" : `${regCount}/${evt.maxRegistrations || "∞"}`}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden border hub-bar-container">
                              <div
                                style={{
                                  width: evt.maxRegistrations
                                    ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                                    : "5%",
                                  backgroundColor: isSoldOut ? "#ef4444" : "var(--hub-accent-color)",
                                }}
                                className="h-full rounded-full transition-all duration-300"
                              />
                            </div>
                          </div>
                        )}

                        <Link
                          href={`/e/${organization.slug}/${evt.slug}`}
                          className={`w-full inline-flex items-center justify-center text-[10px] font-black py-2.5 rounded-xl text-center transition-all ${
                            isSoldOut
                              ? "hub-btn-soldout cursor-not-allowed"
                              : "hub-btn-primary hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]"
                          }`}
                        >
                          {isSoldOut ? "Closed" : "Register Seat"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {organization.hubLayout === "LIST" && (
              <div className="flex flex-col gap-4 hub-list">
                {events.map((evt: HubEvent) => {
                  const regCount = evt._count?.registrations || 0;
                  const isSoldOut = evt.maxRegistrations && regCount >= evt.maxRegistrations;
                  const shouldAutoFit = evt.autoFitImage !== null ? evt.autoFitImage : organization.autoFitImages;

                  return (
                    <div
                      key={evt.id}
                      className="rounded-3xl border p-5 shadow flex flex-col md:flex-row items-center gap-6 text-left relative hub-card"
                    >
                      <div className={`w-full md:w-32 rounded-2xl border flex items-center justify-center flex-shrink-0 relative overflow-hidden hub-card-cover ${
                        shouldAutoFit ? 'h-auto' : 'h-20'
                      }`}>
                        {evt.posterUrl ? (
                          <img
                            src={evt.posterUrl}
                            alt={evt.title}
                            className={shouldAutoFit ? "relative w-full h-auto object-contain" : "absolute inset-0 w-full h-full object-cover"}
                          />
                        ) : (
                          <>
                            <div
                              style={{ backgroundColor: "var(--hub-accent-color)" }}
                              className="absolute w-16 h-16 rounded-full blur-xl opacity-20"
                            />
                            <span className="text-center font-black uppercase text-[10px] px-3 z-10 truncate max-w-full hub-poster-placeholder-text">
                              {evt.title.substring(0, 12)}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-black truncate">{evt.title}</h4>
                        <p className="text-[10px] line-clamp-1 font-semibold leading-normal opacity-75">
                          {evt.description}
                        </p>
                        <div className="flex gap-4 text-[9px] font-bold opacity-65">
                          {organization.showCardDate !== false && <span>📅 {formatFriendlyDate(evt.date)}</span>}
                          {organization.showCardLocation !== false && <span>📍 {evt.location}</span>}
                        </div>
                      </div>

                      <div className="w-full md:w-56 flex-shrink-0 flex flex-col justify-center space-y-3.5 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-6 hub-border">
                        {organization.showCardCapacity !== false && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-extrabold opacity-65">
                              <span>Capacity</span>
                              <span>
                                {isSoldOut ? "Sold Out" : `${regCount} / ${evt.maxRegistrations || "∞"}`}
                              </span>
                            </div>
                            <div className="w-full h-1 rounded-full overflow-hidden border hub-bar-container">
                              <div
                                style={{
                                  width: evt.maxRegistrations
                                    ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                                    : "5%",
                                  backgroundColor: isSoldOut ? "#ef4444" : "var(--hub-accent-color)",
                                }}
                                className="h-full rounded-full transition-all duration-300"
                              />
                            </div>
                          </div>
                        )}

                        <Link
                          href={`/e/${organization.slug}/${evt.slug}`}
                          className={`w-full inline-flex items-center justify-center text-[10px] font-black py-2 rounded-xl text-center transition-all ${
                            isSoldOut
                              ? "hub-btn-soldout cursor-not-allowed"
                              : "hub-btn-primary hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]"
                          }`}
                        >
                          {isSoldOut ? "Closed" : "Register Seat"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {organization.hubLayout === "CAROUSEL" && (
              <div className="relative w-full overflow-hidden">
                <div className="flex gap-6 overflow-x-auto scrollbar-thin scrollbar-track-transparent snap-x snap-mandatory py-4 hub-carousel">
                  {events.map((evt: HubEvent) => {
                    const regCount = evt._count?.registrations || 0;
                    const isSoldOut = evt.maxRegistrations && regCount >= evt.maxRegistrations;
                    const shouldAutoFit = evt.autoFitImage !== null ? evt.autoFitImage : organization.autoFitImages;

                    return (
                      <div
                        key={evt.id}
                        style={{ flex: "0 0 280px" }}
                        className="rounded-3xl border p-5 shadow-lg flex flex-col justify-between space-y-5 snap-start relative overflow-hidden hub-card"
                      >
                        <div className={`rounded-2xl border flex items-center justify-center relative overflow-hidden flex-shrink-0 hub-card-cover ${
                          shouldAutoFit ? 'h-auto' : 'h-28'
                        }`}>
                          {evt.posterUrl ? (
                            <img
                              src={evt.posterUrl}
                              alt={evt.title}
                              className={shouldAutoFit ? "relative w-full h-auto object-contain" : "absolute inset-0 w-full h-full object-cover"}
                            />
                          ) : (
                            <>
                              <div
                                style={{ backgroundColor: "var(--hub-accent-color)" }}
                                className="absolute w-20 h-20 rounded-full blur-2xl opacity-20"
                              />
                              <span className="text-center px-4 font-black uppercase tracking-wider text-[10px] z-10 truncate max-w-full hub-poster-placeholder-text">
                                {evt.title}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <h4 className="text-sm font-black line-clamp-1">{evt.title}</h4>
                          <p className="text-[10px] line-clamp-2 leading-relaxed font-semibold opacity-75">
                            {evt.description}
                          </p>
                        </div>

                        <div className="text-[9px] space-y-0.5 font-bold opacity-65">
                          {organization.showCardDate !== false && <div>📅 {formatFriendlyDate(evt.date)}</div>}
                          {organization.showCardLocation !== false && <div>📍 {evt.location}</div>}
                        </div>

                        <div className="space-y-3.5 pt-3 border-t hub-border">
                          {organization.showCardCapacity !== false && (
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[9px] font-extrabold opacity-65">
                                <span>Capacity</span>
                                <span>
                                  {isSoldOut ? "Closed" : `${regCount}/${evt.maxRegistrations || "∞"}`}
                                </span>
                              </div>
                              <div className="w-full h-1 rounded-full overflow-hidden border hub-bar-container">
                                <div
                                  style={{
                                    width: evt.maxRegistrations
                                      ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                                      : "5%",
                                    backgroundColor: isSoldOut ? "#ef4444" : "var(--hub-accent-color)",
                                  }}
                                  className="h-full rounded-full transition-all duration-300"
                                />
                              </div>
                            </div>
                          )}

                          <Link
                            href={`/e/${organization.slug}/${evt.slug}`}
                            className={`w-full inline-flex items-center justify-center text-[10px] font-black py-2 rounded-xl text-center transition-all ${
                              isSoldOut
                                ? "hub-btn-soldout cursor-not-allowed"
                                : "hub-btn-primary hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]"
                            }`}
                          >
                            {isSoldOut ? "Closed" : "Register Seat"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer brand indicator */}
        <div className="text-center text-[10px] border-t pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 hub-border hub-muted-text">
          <span>&copy; 2026 {organization.name}. Powered by <strong className="hub-footer-strong">EventsPlug</strong>.</span>
          <span className="flex gap-4">
            <Link href="/" className="hover:underline">EventsPlug Home</Link>
            <Link href="/portal" className="hover:underline">Organizer Sign In</Link>
          </span>
        </div>
      </div>

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
    </main>
  );
}
