"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatFriendlyDate } from "@/lib/date-utils";
import { deriveThemeVariables } from "@/lib/color-utils";

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
  isFeatured?: boolean;
  registrationDeadline?: string;
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
      baseMode?: string | null;
      accentHue?: number | null;
      accentChroma?: number | null;
      surfaceTone?: string | null;
      skinId?: string | null;
      fontPairingId?: string | null;
      cssVariables?: any;
    };
    defaultTheme?: {
      baseMode?: string | null;
      accentHue?: number | null;
      accentChroma?: number | null;
      surfaceTone?: string | null;
      skinId?: string | null;
      fontPairingId?: string | null;
      cssVariables?: any;
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
  const featuredEvents = React.useMemo(() => events.filter(e => e.isFeatured), [events]);
  const regularEvents = React.useMemo(() => events.filter(e => !e.isFeatured), [events]);

  // Resolve base CSS themes from organization settings
  const selTheme = organization.hubTheme || organization.defaultTheme || {
    baseMode: "auto",
    accentHue: 250,
    accentChroma: 0.18,
    surfaceTone: "mid",
    skinId: "frosted",
    fontPairingId: "inter-inter",
  };

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

  const selSkin = (organization as any).hubSkin || (organization as any).defaultSkin || {
    borderRadius: "12px",
    borderStyle: "solid",
    borderWidth: "1px",
    shadowStyle: "flat",
    fontFamily: "var(--font-sans)",
    backdropStyle: "DOT_MATRIX",
  };

  const derived = deriveThemeVariables(finalTheme, themeMode);

  return (
    <main
      className="min-h-screen relative overflow-hidden font-sans pb-16 hub-bg"
      style={{
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      <style jsx global>{`
        :root {
          --hub-bg-color: ${derived.bgColor};
          --hub-bg-rgb: ${derived.bgRgb};
          --hub-text-color: ${derived.textColor};
          --hub-card-bg: ${derived.cardBg};
          --hub-card-border: ${derived.cardBorder};
          --hub-accent-color: ${derived.primaryColor};
          --hub-grid-line-color: ${derived.gridLineColor};
          --hub-grid-opacity: ${derived.gridOpacity};
          --hub-spotlight-opacity: ${themeMode === "light" ? "0.03" : "0.06"};
          --hub-aurora-accent-opacity: ${themeMode === "light" ? "0.02" : "0.04"};

          --hub-cover-bg: ${themeMode === "light" ? "rgba(var(--hub-bg-rgb), 0.03)" : "rgba(255, 255, 255, 0.01)"};
          --hub-cover-border: ${derived.cardBorder};
          --hub-muted-title: ${themeMode === "light" ? "#475569" : "#94a3b8"};
          --hub-muted-text: ${derived.textSecondary};
          --hub-border-color: ${derived.cardBorder};
          
          --hub-logo-bg: ${themeMode === "light" ? "rgba(var(--hub-bg-rgb), 0.03)" : "rgba(255, 255, 255, 0.03)"};
          --hub-title-color: ${derived.textColor};
          --hub-poster-text: ${derived.textSecondary};
          
          --hub-soldout-btn-bg: ${themeMode === "light" ? "rgba(var(--hub-bg-rgb), 0.03)" : "rgba(255, 255, 255, 0.02)"};
          --hub-soldout-btn-border: ${derived.cardBorder};
          --hub-soldout-btn-text: ${derived.textSecondary};
          
          --hub-footer-strong-color: ${derived.textSecondary};
          
          --hub-theme-toggle-bg: ${themeMode === "light" ? "rgba(255, 255, 255, 0.7)" : "rgba(15, 23, 42, 0.7)"};
          --hub-theme-toggle-border: ${derived.cardBorder};
          --hub-theme-toggle-text: ${themeMode === "light" ? "#1e293b" : "#f1f5f9"};
          --hub-theme-toggle-hover: ${themeMode === "light" ? "#f1f5f9" : "rgba(30, 41, 59, 0.8)"};

          --hub-banner-overlay-bg: ${themeMode === "light" 
            ? "linear-gradient(to top, var(--hub-bg-color) 0%, rgba(var(--hub-bg-rgb), 0.05) 100%)" 
            : "linear-gradient(to top, var(--hub-bg-color) 0%, rgba(var(--hub-bg-rgb), 0.1) 100%)"};

          /* Structural skin tokens - refined for minimalism */
          --hub-border-radius: ${derived.radiusCard === '0px' ? '0px' : '12px'};
          --hub-border-style: solid;
          --hub-border-width: ${derived.cardBorder === 'none' ? '0px' : '1px'};
          --hub-font-family: var(--hub-font-body);
          --hub-font-display: ${derived.fontDisplay};
          --hub-font-body: ${derived.fontBody};
          --hub-box-shadow: ${derived.shadowCard === 'none' ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)'};
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
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .hub-card:hover {
          border-color: ${themeMode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'};
        }
        .hub-card-cover {
          background: var(--hub-cover-bg);
          border: none !important;
          box-shadow: none !important;
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
        .hub-btn-primary {
          background-color: var(--hub-accent-color);
          color: #ffffff !important;
          transition: background-color 0.2s ease, opacity 0.2s ease;
        }
        .hub-btn-primary:hover {
          opacity: 0.9;
        }
        .hub-btn-primary:active {
          opacity: 0.95;
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
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        .hub-theme-toggle:hover {
          background-color: var(--hub-theme-toggle-hover);
        }
        .hub-theme-toggle:active {
          transform: scale(0.95);
        }

        /* Backdrop grid styling */
        .hub-grid-mesh {
          background-image: linear-gradient(to right, rgba(var(--hub-grid-line-color), var(--hub-grid-opacity)) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--hub-grid-line-color), var(--hub-grid-opacity)) 1px, transparent 1px);
        }
        .hub-dot-matrix {
          background-image: radial-gradient(rgba(var(--hub-grid-line-color), var(--hub-grid-opacity)) 1px, transparent 1px);
        }
        .hub-banner-overlay {
          background-image: var(--hub-banner-overlay-bg);
        }
      `}</style>

      {/* Simplified, static, high-performance background backdrop */}
      {(() => {
        const themeStyle = organization.hubThemeStyle || selSkin.backdropStyle || "DOT_MATRIX";
        
        // Distill complex layouts to crisp grid meshes or subtle radial ambient glows
        const hasGlow = ["GRID_WARP", "AURORA_GLOW", "AURORA", "GRADIENT", "SHAPEGRID", "PIXELSNOW", "LIGHTFALL", "SIDERAYS", "LIGHTRAYS"].includes(themeStyle);
        const isMesh = ["GRID_WARP", "SHAPEGRID", "SIDERAYS", "LIGHTRAYS"].includes(themeStyle);
        
        return (
          <>
            {hasGlow && (
              <div
                style={{
                  backgroundColor: "var(--hub-accent-color)",
                }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full blur-[120px] pointer-events-none opacity-[var(--hub-spotlight-opacity)] transition-all duration-300"
              />
            )}
            <div
              className={`absolute inset-0 pointer-events-none ${isMesh ? "hub-grid-mesh" : "hub-dot-matrix"}`}
              style={{
                backgroundSize: isMesh ? '24px 24px' : '16px 16px',
                transition: 'background-image 0.3s ease',
              }}
            />
          </>
        );
      })()}

      {organization.hubBannerUrl && (
        <div className="w-full h-40 md:h-52 relative overflow-hidden border-b hub-border">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${organization.hubBannerUrl})` }}
          />
          <div className="absolute inset-0 hub-banner-overlay" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12 relative z-10">
        {/* Org Hub directory header */}
        <div className="flex flex-col items-start space-y-4 max-w-2xl hub-header">
          {organization.hubLogoUrl ? (
            <img
              src={organization.hubLogoUrl}
              alt={organization.hubTitle || organization.name}
              className="block h-12 w-auto object-contain rounded-lg border p-1 shadow-sm hub-logo-img"
            />
          ) : (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border shadow-sm hub-icon-container">
              {organization.hubIcon && organization.hubIcon !== "🏫" ? (
                <span className="text-xl">{organization.hubIcon}</span>
              ) : (
                <svg className="w-5 h-5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                  <line x1="9" y1="22" x2="9" y2="16"></line>
                  <line x1="15" y1="22" x2="15" y2="16"></line>
                  <line x1="9" y1="16" x2="15" y2="16"></line>
                  <path d="M8 6h.01"></path>
                  <path d="M16 6h.01"></path>
                  <path d="M8 10h.01"></path>
                  <path d="M16 10h.01"></path>
                  <path d="M12 6h.01"></path>
                  <path d="M12 10h.01"></path>
                </svg>
              )}
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase hub-title">
              {organization.hubTitle || organization.name}
            </h1>
            <p className="text-xs font-semibold opacity-55 tracking-wide uppercase">
              {events.length} {events.length === 1 ? "event" : "events"} scheduled
            </p>
          </div>
          <p className="text-sm md:text-base leading-relaxed hub-description opacity-80">
            {organization.hubDescription || "Browse upcoming events and register to reserve your seat."}
          </p>
        </div>

        {events.length === 0 ? (
          /* Empty listing state card */
          <div className="rounded-xl p-10 text-center max-w-sm mx-auto space-y-3 hub-card">
            <svg className="w-8 h-8 opacity-40 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-6l-2 3h-4l-2-3H2" />
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wide hub-muted-title">
                No Active Events
              </h4>
              <p className="text-xs leading-relaxed hub-muted-text">
                There are no upcoming events listed at the moment. Check back later!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured Events Spotlight Section */}
            {featuredEvents.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="h-[1px] flex-1 bg-current opacity-10"></span>
                  <h2 className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase whitespace-nowrap flex items-center gap-1.5">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Featured Spotlight
                  </h2>
                  <span className="h-[1px] flex-1 bg-current opacity-10"></span>
                </div>
                
                <div className={
                  featuredEvents.length === 1 
                    ? "grid grid-cols-1 gap-6" 
                    : "grid grid-cols-1 md:grid-cols-2 gap-6"
                }>
                  {featuredEvents.map((evt: HubEvent) => {
                    const regCount = evt._count?.registrations || 0;
                    const isSoldOut = evt.maxRegistrations && regCount >= evt.maxRegistrations;
                    const deadline = evt.registrationDeadline ? new Date(evt.registrationDeadline) : new Date(evt.date);
                    const isPast = deadline < new Date();
                    const isClosed = isSoldOut || isPast;
                    
                    if (featuredEvents.length === 1) {
                      return (
                        <div
                          key={evt.id}
                          className={`flex flex-col md:flex-row gap-6 p-5 relative overflow-hidden hub-card border-l-2 border-[var(--hub-accent-color)] ${isClosed ? "opacity-75" : ""}`}
                        >
                          {isClosed && (
                            <div className={`absolute top-4 right-4 z-20 ${isPast ? "bg-amber-600/90" : "bg-red-600/90"} text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm`}>
                              {isPast ? "Ended" : "Sold Out"}
                            </div>
                          )}

                          <div className="w-full md:w-[45%] aspect-[16/10] md:aspect-auto md:h-64 rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0 hub-card-cover">
                            {evt.posterUrl ? (
                              <img
                                src={evt.posterUrl}
                                alt={evt.title}
                                className={`absolute inset-0 w-full h-full object-cover ${isClosed ? "grayscale opacity-30" : ""}`}
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[color-mix(in_srgb,var(--hub-accent-color)_5%,var(--hub-bg-color))] w-full h-full border border-dashed border-current opacity-20">
                                <span className="text-center font-bold tracking-tight text-[10px] z-10 truncate max-w-full uppercase opacity-80">
                                  {evt.title}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col justify-between flex-1 py-1 space-y-4">
                            <div className="space-y-3">
                              <div className="inline-flex items-center gap-1.5 bg-[color-mix(in_srgb,var(--hub-accent-color)_10%,transparent)] text-[var(--hub-accent-color)] text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
                                </svg>
                                Featured Selection
                              </div>
                              <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-tight uppercase hub-title">{evt.title}</h3>
                              <p className="text-xs leading-relaxed opacity-60 line-clamp-3">
                                {evt.description}
                              </p>
                            </div>

                            <div className="space-y-4">
                              {(organization.showCardDate !== false || organization.showCardLocation !== false) && (
                                <div className="text-[11px] space-y-1.5 font-semibold opacity-60">
                                  {organization.showCardDate !== false && (
                                    <div className="flex items-center gap-1.5">
                                      <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                      </svg>
                                      {formatFriendlyDate(evt.date)}
                                    </div>
                                  )}
                                  {organization.showCardLocation !== false && evt.location && (
                                    <div className="flex items-center gap-1.5">
                                      <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                      </svg>
                                      {evt.location}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="space-y-3">
                                {organization.showCardCapacity !== false && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-bold tracking-wider uppercase opacity-55">
                                      <span>Capacity</span>
                                      <span>
                                        {isClosed ? (isPast ? "Ended" : "Closed") : `${regCount} / ${evt.maxRegistrations || "∞"}`}
                                      </span>
                                    </div>
                                    <div className="w-full h-1 rounded-full overflow-hidden bg-current opacity-10">
                                      <div
                                        style={{
                                          width: evt.maxRegistrations
                                            ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                                            : "5%",
                                          backgroundColor: "var(--hub-accent-color)",
                                        }}
                                        className="h-full rounded-full transition-all duration-300"
                                      />
                                    </div>
                                  </div>
                                )}

                                <Link
                                  href={`/e/${organization.slug}/${evt.slug}`}
                                  className={`w-full md:w-auto inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg text-center transition-all ${
                                    isClosed
                                      ? "hub-btn-soldout cursor-not-allowed"
                                      : "hub-btn-primary"
                                  }`}
                                >
                                  {isClosed ? (isPast ? "Ended" : "Closed") : "Register"}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={evt.id}
                        className={`flex flex-col justify-between gap-4 p-4 relative overflow-hidden hub-card border-t border-[color-mix(in_srgb,var(--hub-accent-color)_20%,transparent)] ${isClosed ? "opacity-75" : ""}`}
                      >
                        {isClosed && (
                          <div className={`absolute top-4 right-4 z-20 ${isPast ? "bg-amber-600/90" : "bg-red-600/90"} text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm`}>
                            {isPast ? "Ended" : "Sold Out"}
                          </div>
                        )}

                        <div className="rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0 hub-card-cover h-36">
                          {evt.posterUrl ? (
                            <img
                              src={evt.posterUrl}
                              alt={evt.title}
                              className={`absolute inset-0 w-full h-full object-cover ${isClosed ? "grayscale opacity-30" : ""}`}
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[color-mix(in_srgb,var(--hub-accent-color)_5%,var(--hub-bg-color))] w-full h-full border border-dashed border-current opacity-20">
                              <span className="text-center font-bold tracking-tight text-[10px] z-10 truncate max-w-full uppercase opacity-80">
                                {evt.title}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-between flex-1 space-y-4">
                          <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 bg-[color-mix(in_srgb,var(--hub-accent-color)_10%,transparent)] text-[var(--hub-accent-color)] text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                              <svg className="w-2 h-2 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
                              </svg>
                              Featured
                            </div>
                            <h3 className="text-base font-bold leading-snug uppercase tracking-tight line-clamp-2 hub-title">{evt.title}</h3>
                            <p className="text-[11px] leading-relaxed opacity-60 line-clamp-2">
                              {evt.description}
                            </p>
                          </div>

                          <div className="space-y-3">
                            {(organization.showCardDate !== false || organization.showCardLocation !== false) && (
                              <div className="text-[10px] space-y-1 font-semibold opacity-60">
                                {organization.showCardDate !== false && (
                                  <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                      <line x1="16" y1="2" x2="16" y2="6"></line>
                                      <line x1="8" y1="2" x2="8" y2="6"></line>
                                      <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    {formatFriendlyDate(evt.date)}
                                  </div>
                                )}
                                {organization.showCardLocation !== false && evt.location && (
                                  <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                      <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    {evt.location}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="space-y-3 pt-1">
                              {organization.showCardCapacity !== false && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[9px] font-bold tracking-wider uppercase opacity-55">
                                    <span>Capacity</span>
                                    <span>
                                      {isSoldOut ? "Closed" : `${regCount} / ${evt.maxRegistrations || "∞"}`}
                                    </span>
                                  </div>
                                  <div className="w-full h-1 rounded-full overflow-hidden bg-current opacity-10">
                                    <div
                                      style={{
                                        width: evt.maxRegistrations
                                          ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                                          : "5%",
                                        backgroundColor: "var(--hub-accent-color)",
                                      }}
                                      className="h-full rounded-full transition-all duration-300"
                                    />
                                  </div>
                                </div>
                              )}

                              <Link
                                href={`/e/${organization.slug}/${evt.slug}`}
                                className={`w-full inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg text-center transition-all ${
                                  isSoldOut
                                    ? "hub-btn-soldout cursor-not-allowed"
                                    : "hub-btn-primary"
                                }`}
                              >
                                {isSoldOut ? "Closed" : "Register"}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Regular Events Section */}
            {regularEvents.length > 0 && (
              <section className="space-y-6">
                {featuredEvents.length > 0 && (
                  <div className="flex items-center gap-4 pt-2">
                    <h2 className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase whitespace-nowrap">
                      Upcoming Listings
                    </h2>
                    <span className="h-[1px] flex-1 bg-current opacity-10"></span>
                  </div>
                )}

                {organization.hubLayout === "GRID" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 hub-grid">
                    {regularEvents.map((evt: HubEvent) => {
                      const regCount = evt._count?.registrations || 0;
                      const isSoldOut = evt.maxRegistrations && regCount >= evt.maxRegistrations;
                      const deadline = evt.registrationDeadline ? new Date(evt.registrationDeadline) : new Date(evt.date);
                      const isPast = deadline < new Date();
                      const isClosed = isSoldOut || isPast;
                      const shouldAutoFit = evt.autoFitImage !== null ? evt.autoFitImage : organization.autoFitImages;

                      return (
                        <div
                          key={evt.id}
                          className={`flex flex-col justify-between gap-4 p-4 relative overflow-hidden hub-card ${isClosed ? "opacity-75" : ""}`}
                        >
                          {isClosed && (
                            <div className={`absolute top-4 right-4 z-20 ${isPast ? "bg-amber-600/90" : "bg-red-600/90"} text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm`}>
                              {isPast ? "Ended" : "Sold Out"}
                            </div>
                          )}

                          <div className={`rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0 hub-card-cover ${
                            shouldAutoFit ? 'h-auto' : 'h-32'
                          }`}>
                            {evt.posterUrl ? (
                              <img
                                src={evt.posterUrl}
                                alt={evt.title}
                                className={`${shouldAutoFit ? "relative w-full h-full object-cover" : "absolute inset-0 w-full h-full object-cover"} ${isClosed ? "grayscale opacity-30" : ""}`}
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[color-mix(in_srgb,var(--hub-accent-color)_5%,var(--hub-bg-color))] w-full h-full border border-dashed border-current opacity-20">
                                <span className="text-center font-bold tracking-tight text-[10px] z-10 truncate max-w-full uppercase opacity-80">
                                  {evt.title}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col justify-between flex-1 space-y-4">
                            <div className="space-y-1">
                              <h4 className="font-bold tracking-tight text-sm uppercase">{evt.title}</h4>
                              <p className="leading-relaxed opacity-60 text-[11px] line-clamp-2">
                                {evt.description}
                              </p>
                            </div>

                            <div className="space-y-3">
                              {(organization.showCardDate !== false || organization.showCardLocation !== false) && (
                                <div className="text-[10px] space-y-1 font-semibold opacity-60">
                                  {organization.showCardDate !== false && (
                                    <div className="flex items-center gap-1.5">
                                      <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                      </svg>
                                      {formatFriendlyDate(evt.date)}
                                    </div>
                                  )}
                                  {organization.showCardLocation !== false && evt.location && (
                                    <div className="flex items-center gap-1.5">
                                      <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                      </svg>
                                      {evt.location}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="space-y-3 pt-1">
                                {organization.showCardCapacity !== false && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-bold tracking-wider uppercase opacity-55">
                                      <span>Capacity</span>
                                      <span>
                                        {isClosed ? (isPast ? "Ended" : "Closed") : `${regCount} / ${evt.maxRegistrations || "∞"}`}
                                      </span>
                                    </div>
                                    <div className="w-full h-1 rounded-full overflow-hidden bg-current opacity-10">
                                      <div
                                        style={{
                                          width: evt.maxRegistrations
                                            ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                                            : "5%",
                                          backgroundColor: "var(--hub-accent-color)",
                                        }}
                                        className="h-full rounded-full transition-all duration-300"
                                      />
                                    </div>
                                  </div>
                                )}

                                <Link
                                  href={`/e/${organization.slug}/${evt.slug}`}
                                  className={`w-full inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg text-center transition-all ${
                                    isClosed
                                      ? "hub-btn-soldout cursor-not-allowed"
                                      : "hub-btn-primary"
                                  }`}
                                >
                                  {isClosed ? (isPast ? "Ended" : "Closed") : "Register"}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {organization.hubLayout === "LIST" && (
                  <div className="flex flex-col gap-4 hub-list">
                    {regularEvents.map((evt: HubEvent) => {
                      const regCount = evt._count?.registrations || 0;
                      const isSoldOut = evt.maxRegistrations && regCount >= evt.maxRegistrations;
                      const deadline = evt.registrationDeadline ? new Date(evt.registrationDeadline) : new Date(evt.date);
                      const isPast = deadline < new Date();
                      const isClosed = isSoldOut || isPast;
                      const shouldAutoFit = evt.autoFitImage !== null ? evt.autoFitImage : organization.autoFitImages;

                      return (
                        <div
                          key={evt.id}
                          className={`flex flex-col md:flex-row items-center gap-5 p-4 text-left relative hub-card ${isClosed ? "opacity-75" : ""}`}
                        >
                          {isClosed && (
                            <div className={`absolute top-4 right-4 z-20 ${isPast ? "bg-amber-600/90" : "bg-red-600/90"} text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm`}>
                              {isPast ? "Ended" : "Sold Out"}
                            </div>
                          )}

                          <div className={`w-full md:w-32 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden hub-card-cover ${
                            shouldAutoFit ? 'h-auto' : 'h-20'
                          }`}>
                            {evt.posterUrl ? (
                              <img
                                src={evt.posterUrl}
                                alt={evt.title}
                                className={`${shouldAutoFit ? "relative w-full h-auto object-contain" : "absolute inset-0 w-full h-full object-cover"} ${isClosed ? "grayscale opacity-30" : ""}`}
                              />
                            ) : (
                              <div className="w-full h-20 flex items-center justify-center bg-[color-mix(in_srgb,var(--hub-accent-color)_5%,var(--hub-bg-color))] rounded border border-dashed border-current opacity-20 relative">
                                <span className="text-center font-bold tracking-tight text-[10px] px-3 z-10 truncate max-w-full uppercase">
                                  {evt.title.substring(0, 12)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-1.5 py-0.5">
                            <h4 className="text-base font-bold uppercase truncate">{evt.title}</h4>
                            <p className="text-xs line-clamp-2 opacity-60 leading-relaxed">
                              {evt.description}
                            </p>
                            <div className="flex gap-4 text-[10px] font-semibold opacity-60">
                              {organization.showCardDate !== false && (
                                <span className="flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                  </svg>
                                  {formatFriendlyDate(evt.date)}
                                </span>
                              )}
                              {organization.showCardLocation !== false && evt.location && (
                                <span className="flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                  </svg>
                                  {evt.location}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="w-full md:w-48 flex-shrink-0 flex flex-col justify-center space-y-3 pt-3 md:pt-0 md:pl-4">
                            {organization.showCardCapacity !== false && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[9px] font-bold tracking-wider uppercase opacity-55">
                                  <span>Capacity</span>
                                  <span>
                                    {isClosed ? (isPast ? "Ended" : "Closed") : `${regCount} / ${evt.maxRegistrations || "∞"}`}
                                  </span>
                                </div>
                                <div className="w-full h-1 rounded-full overflow-hidden bg-current opacity-10">
                                  <div
                                    style={{
                                      width: evt.maxRegistrations
                                        ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                                        : "5%",
                                      backgroundColor: "var(--hub-accent-color)",
                                    }}
                                    className="h-full rounded-full transition-all duration-300"
                                  />
                                </div>
                              </div>
                            )}

                            <Link
                              href={`/e/${organization.slug}/${evt.slug}`}
                              className={`w-full inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg text-center transition-all ${
                                isClosed
                                  ? "hub-btn-soldout cursor-not-allowed"
                                  : "hub-btn-primary"
                              }`}
                            >
                              {isClosed ? (isPast ? "Ended" : "Closed") : "Register"}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {organization.hubLayout === "CAROUSEL" && (
                  <div className="relative w-full overflow-hidden">
                    <div className="flex gap-5 overflow-x-auto scrollbar-thin scrollbar-track-transparent snap-x snap-mandatory py-2 hub-carousel">
                      {regularEvents.map((evt: HubEvent) => {
                        const regCount = evt._count?.registrations || 0;
                        const isSoldOut = evt.maxRegistrations && regCount >= evt.maxRegistrations;
                        const deadline = evt.registrationDeadline ? new Date(evt.registrationDeadline) : new Date(evt.date);
                        const isPast = deadline < new Date();
                        const isClosed = isSoldOut || isPast;
                        const shouldAutoFit = evt.autoFitImage !== null ? evt.autoFitImage : organization.autoFitImages;

                        return (
                          <div
                            key={evt.id}
                            style={{
                              flex: "0 0 280px",
                            }}
                            className={`flex flex-col justify-between space-y-4 snap-start relative overflow-hidden hub-card p-4 ${isClosed ? "opacity-75" : ""}`}
                          >
                            {isClosed && (
                              <div className={`absolute top-4 right-4 z-20 ${isPast ? "bg-amber-600/90" : "bg-red-600/90"} text-white text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm`}>
                                {isPast ? "Ended" : "Sold Out"}
                              </div>
                            )}

                            <div className={`rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0 hub-card-cover ${
                              shouldAutoFit ? 'h-auto' : 'h-28'
                            }`}>
                              {evt.posterUrl ? (
                                <img
                                  src={evt.posterUrl}
                                  alt={evt.title}
                                  className={`${shouldAutoFit ? "relative w-full h-auto object-contain" : "absolute inset-0 w-full h-full object-cover"} ${isClosed ? "grayscale opacity-30" : ""}`}
                                />
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[color-mix(in_srgb,var(--hub-accent-color)_5%,var(--hub-bg-color))] w-full h-full border border-dashed border-current opacity-20">
                                  <span className="text-center font-bold tracking-tight text-[10px] z-10 truncate max-w-full uppercase">
                                    {evt.title}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-1 flex-1">
                              <h4 className="text-sm font-bold uppercase line-clamp-1">{evt.title}</h4>
                              <p className="text-[11px] line-clamp-2 opacity-60 leading-relaxed">
                                {evt.description}
                              </p>
                            </div>

                            <div className="space-y-3">
                              <div className="text-[10px] space-y-1 font-semibold opacity-60">
                                {organization.showCardDate !== false && (
                                  <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                      <line x1="16" y1="2" x2="16" y2="6"></line>
                                      <line x1="8" y1="2" x2="8" y2="6"></line>
                                      <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    {formatFriendlyDate(evt.date)}
                                  </div>
                                )}
                                {organization.showCardLocation !== false && evt.location && (
                                  <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                      <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    {evt.location}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3 pt-1">
                                {organization.showCardCapacity !== false && (
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] font-bold tracking-wider uppercase opacity-55">
                                      <span>Capacity</span>
                                      <span>
                                        {isClosed ? (isPast ? "Ended" : "Closed") : `${regCount} / ${evt.maxRegistrations || "∞"}`}
                                      </span>
                                    </div>
                                    <div className="w-full h-1 rounded-full overflow-hidden bg-current opacity-10">
                                      <div
                                        style={{
                                          width: evt.maxRegistrations
                                            ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                                            : "5%",
                                          backgroundColor: "var(--hub-accent-color)",
                                        }}
                                        className="h-full rounded-full transition-all duration-300"
                                      />
                                    </div>
                                  </div>
                                )}

                                <Link
                                  href={`/e/${organization.slug}/${evt.slug}`}
                                  className={`w-full inline-flex items-center justify-center text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg text-center transition-all ${
                                    isClosed
                                      ? "hub-btn-soldout cursor-not-allowed"
                                      : "hub-btn-primary"
                                  }`}
                                >
                                  {isClosed ? (isPast ? "Ended" : "Closed") : "Register"}
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* Footer brand indicator */}
        <div className="text-center text-[10px] border-t pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 hub-border hub-muted-text opacity-50 font-medium">
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
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-3 rounded-full border shadow-sm transition-all duration-200 hub-theme-toggle"
      >
        {themeMode === "dark" ? (
          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          <svg className="w-4 h-4 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
    </main>
  );
}
