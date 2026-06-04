"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatFriendlyDate } from "@/lib/date-utils";
import { getContrastAdjustedColor } from "@/lib/color-utils";

interface PublicHubClientProps {
  organization: any;
  events: any[];
}

export default function PublicHubClient({ organization, events }: PublicHubClientProps) {
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("eventsplug-hub-theme-preference");
    if (saved === "dark" || saved === "light") {
      setThemeMode(saved);
    } else {
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      setThemeMode(prefersLight ? "light" : "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(newMode);
    localStorage.setItem("eventsplug-hub-theme-preference", newMode);
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

  // Determine active mode colors
  const isLight = mounted && themeMode === "light";
  const bgColor = isLight ? "#f8fafc" : (organization.hubBgColor || variables["--bg-color"] || "#090d16");
  
  // If a custom background is set, or theme uses default solid gray backgrounds, use an adaptive transparent overlay so card tints with bgColor
  const cardBg = isLight
    ? "rgba(255, 255, 255, 0.75)"
    : (organization.hubBgColor || variables["--card-bg"] === "#111827" || variables["--card-bg"] === "#1e293b" || !variables["--card-bg"]
        ? "rgba(255, 255, 255, 0.045)"
        : variables["--card-bg"]);
  const textColor = isLight ? "#0f172a" : (variables["--text-color"] || "#f8fafc");

  // Dynamically calculate contrast-adjusted accent color against the active background
  const adjustedAccentColor = getContrastAdjustedColor(primaryColor, bgColor);

  // Layout-specific styling mapping
  const cardStyles: React.CSSProperties = {
    backgroundColor: cardBg,
    borderColor: isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(248, 250, 252, 0.08)",
  };

  const primaryBtnStyles = {
    backgroundColor: adjustedAccentColor,
    color: "#ffffff",
    boxShadow: `0 4px 14px -4px ${adjustedAccentColor}50`,
  };

  return (
    <main
      style={{
        backgroundColor: bgColor,
        color: textColor,
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
      className="min-h-screen relative overflow-hidden font-sans pb-16"
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
        const themeStyle = organization.hubThemeStyle || "DOT_MATRIX";
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

      {organization.hubBannerUrl && (
        <div className={`w-full h-48 md:h-64 relative overflow-hidden border-b shadow-inner ${
          isLight ? "border-slate-200/60" : "border-white/5"
        }`}>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${organization.hubBannerUrl})` }}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${
            isLight ? "from-white/90 via-white/10 to-white/30" : "from-black/80 via-black/20 to-black/40"
          }`} />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 space-y-12 relative z-10">
        {/* Org Hub directory header */}
        <div className="text-center space-y-4 max-w-xl mx-auto hub-header">
          {organization.hubLogoUrl ? (
            <img
              src={organization.hubLogoUrl}
              alt={organization.hubTitle || organization.name}
              className={`mx-auto block h-16 w-auto object-contain rounded-2xl p-1 border shadow-lg ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/5"
              }`}
            />
          ) : (
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl text-xl shadow ${
              isLight ? "bg-slate-100 border border-slate-200 text-slate-800" : "bg-white/5 border border-white/5 shadow-white/5"
            }`}>
              {organization.hubIcon || "🏫"}
            </div>
          )}
          <div className="space-y-1.5">
            <h1 className={`text-3xl font-black tracking-tight leading-none uppercase hub-title ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
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
            style={cardStyles}
            className="rounded-3xl border p-12 text-center max-w-md mx-auto space-y-4 shadow-xl"
          >
            <span className="text-3xl block">📭</span>
            <div className="space-y-1">
              <h4 className={`text-sm font-black uppercase tracking-wide ${isLight ? "text-slate-400" : "text-slate-550"}`}>
                No Active Events
              </h4>
              <p className={`text-xs font-semibold leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                There are no upcoming events listed on this organization hub currently. Check back later!
              </p>
            </div>
          </div>
        ) : (
          /* Layout Switcher */
          <div className="space-y-6">
            {organization.hubLayout === "GRID" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 hub-grid">
                {events.map((evt: any) => {
                  const regCount = evt._count?.registrations || 0;
                  const isSoldOut = evt.maxRegistrations && regCount >= evt.maxRegistrations;
                  const shouldAutoFit = evt.autoFitImage !== null ? evt.autoFitImage : organization.autoFitImages;

                  return (
                    <div
                      key={evt.id}
                      style={cardStyles}
                      className="rounded-3xl border p-5 shadow-lg flex flex-col justify-between space-y-5 relative overflow-hidden hub-card border-slate-100"
                    >
                      {/* Gradient card top cover placeholder */}
                      <div className={`rounded-2xl border flex items-center justify-center relative overflow-hidden flex-shrink-0 hub-card-cover ${
                        shouldAutoFit ? 'h-auto' : 'h-28'
                      } ${
                        isLight
                          ? "bg-gradient-to-br from-slate-100 to-slate-200/50 border-slate-200/60"
                          : "bg-gradient-to-br from-accent-primary/5 to-slate-950/50 border-white/5"
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
                              style={{ backgroundColor: adjustedAccentColor }}
                              className="absolute w-24 h-24 rounded-full blur-2xl opacity-25"
                            />
                            <span className={`text-center px-4 font-black uppercase tracking-wider text-[10px] z-10 truncate max-w-full ${
                              isLight ? "text-slate-650" : "text-slate-350"
                            }`}>
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

                      <div className={`space-y-3.5 pt-3 border-t ${
                        isLight ? "border-slate-100" : "border-white/5"
                      }`}>
                        {organization.showCardCapacity !== false && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-extrabold opacity-65">
                              <span>Capacity status</span>
                              <span>
                                {isSoldOut ? "Sold Out 🚫" : `${regCount}/${evt.maxRegistrations || "∞"}`}
                              </span>
                            </div>
                            <div className={`w-full h-1.5 rounded-full overflow-hidden border ${
                              isLight ? "bg-slate-100 border-slate-200/60" : "bg-black/40 border-white/5"
                            }`}>
                              <div
                                style={{
                                  width: evt.maxRegistrations
                                    ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                                    : "5%",
                                  backgroundColor: isSoldOut ? "#ef4444" : adjustedAccentColor,
                                }}
                                className="h-full rounded-full transition-all duration-300"
                              />
                            </div>
                          </div>
                        )}

                        <Link
                          href={`/e/${organization.slug}/${evt.slug}`}
                          style={isSoldOut ? {} : primaryBtnStyles}
                          className={`w-full inline-flex items-center justify-center text-[10px] font-black py-2.5 rounded-xl text-center transition-all ${
                            isSoldOut
                              ? isLight
                                ? "bg-slate-100 border border-slate-250 text-slate-400 cursor-not-allowed"
                                : "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
                              : "hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]"
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
                {events.map((evt: any) => {
                  const regCount = evt._count?.registrations || 0;
                  const isSoldOut = evt.maxRegistrations && regCount >= evt.maxRegistrations;
                  const shouldAutoFit = evt.autoFitImage !== null ? evt.autoFitImage : organization.autoFitImages;

                  return (
                    <div
                      key={evt.id}
                      style={cardStyles}
                      className="rounded-3xl border p-5 shadow flex flex-col md:flex-row items-center gap-6 text-left relative hub-card"
                    >
                      <div className={`w-full md:w-32 rounded-2xl border flex items-center justify-center flex-shrink-0 relative overflow-hidden hub-card-cover ${
                        shouldAutoFit ? 'h-auto' : 'h-20'
                      } ${
                        isLight
                          ? "bg-gradient-to-br from-slate-100 to-slate-200/50 border-slate-200/60"
                          : "bg-gradient-to-br from-accent-primary/5 to-slate-950/50 border-white/5"
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
                              style={{ backgroundColor: adjustedAccentColor }}
                              className="absolute w-16 h-16 rounded-full blur-xl opacity-20"
                            />
                            <span className={`text-center font-black uppercase text-[10px] px-3 z-10 truncate max-w-full ${
                              isLight ? "text-slate-600" : "text-slate-400"
                            }`}>
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

                      <div className={`w-full md:w-56 flex-shrink-0 flex flex-col justify-center space-y-3.5 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-6 ${
                        isLight ? "border-slate-100" : "border-white/5"
                      }`}>
                        {organization.showCardCapacity !== false && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-extrabold opacity-65">
                              <span>Capacity</span>
                              <span>
                                {isSoldOut ? "Sold Out" : `${regCount} / ${evt.maxRegistrations || "∞"}`}
                              </span>
                            </div>
                            <div className={`w-full h-1 rounded-full overflow-hidden border ${
                              isLight ? "bg-slate-100 border-slate-200/60" : "bg-black/40 border-white/5"
                            }`}>
                              <div
                                style={{
                                  width: evt.maxRegistrations
                                    ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                                    : "5%",
                                  backgroundColor: isSoldOut ? "#ef4444" : adjustedAccentColor,
                                }}
                                className="h-full rounded-full transition-all duration-300"
                              />
                            </div>
                          </div>
                        )}

                        <Link
                          href={`/e/${organization.slug}/${evt.slug}`}
                          style={isSoldOut ? {} : primaryBtnStyles}
                          className={`w-full inline-flex items-center justify-center text-[10px] font-black py-2 rounded-xl text-center transition-all ${
                            isSoldOut
                              ? isLight
                                ? "bg-slate-100 border border-slate-250 text-slate-400 cursor-not-allowed"
                                : "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
                              : "hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]"
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
                <div className="flex gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent snap-x snap-mandatory py-4 hub-carousel">
                  {events.map((evt: any) => {
                    const regCount = evt._count?.registrations || 0;
                    const isSoldOut = evt.maxRegistrations && regCount >= evt.maxRegistrations;
                    const shouldAutoFit = evt.autoFitImage !== null ? evt.autoFitImage : organization.autoFitImages;

                    return (
                      <div
                        key={evt.id}
                        style={{ ...cardStyles, flex: "0 0 280px" }}
                        className="rounded-3xl border p-5 shadow-lg flex flex-col justify-between space-y-5 snap-start relative overflow-hidden hub-card"
                      >
                        <div className={`rounded-2xl border flex items-center justify-center relative overflow-hidden flex-shrink-0 hub-card-cover ${
                          shouldAutoFit ? 'h-auto' : 'h-28'
                        } ${
                          isLight
                            ? "bg-gradient-to-br from-slate-100 to-slate-200/50 border-slate-200/60"
                            : "bg-gradient-to-br from-accent-primary/5 to-slate-950/50 border-white/5"
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
                                style={{ backgroundColor: adjustedAccentColor }}
                                className="absolute w-20 h-20 rounded-full blur-2xl opacity-20"
                              />
                              <span className={`text-center px-4 font-black uppercase tracking-wider text-[10px] z-10 truncate max-w-full ${
                                isLight ? "text-slate-600" : "text-slate-400"
                              }`}>
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

                        <div className={`space-y-3.5 pt-3 border-t ${isLight ? "border-slate-100" : "border-white/5"}`}>
                          {organization.showCardCapacity !== false && (
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[9px] font-extrabold opacity-65">
                                <span>Capacity</span>
                                <span>
                                  {isSoldOut ? "Closed" : `${regCount}/${evt.maxRegistrations || "∞"}`}
                                </span>
                              </div>
                              <div className={`w-full h-1 rounded-full overflow-hidden border ${
                                isLight ? "bg-slate-100 border-slate-200/60" : "bg-black/40 border-white/5"
                              }`}>
                                <div
                                  style={{
                                    width: evt.maxRegistrations
                                      ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                                      : "5%",
                                    backgroundColor: isSoldOut ? "#ef4444" : adjustedAccentColor,
                                  }}
                                  className="h-full rounded-full transition-all duration-300"
                                />
                              </div>
                            </div>
                          )}

                          <Link
                            href={`/e/${organization.slug}/${evt.slug}`}
                            style={isSoldOut ? {} : primaryBtnStyles}
                            className={`w-full inline-flex items-center justify-center text-[10px] font-black py-2 rounded-xl text-center transition-all ${
                              isSoldOut
                                ? isLight
                                  ? "bg-slate-100 border border-slate-250 text-slate-400 cursor-not-allowed"
                                  : "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
                                : "hover:opacity-95 hover:scale-[1.01] active:scale-[0.99]"
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
        <div className={`text-center text-[10px] border-t pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4 ${
          isLight ? "border-slate-100 text-slate-500" : "border-white/5 text-slate-500"
        }`}>
          <span>&copy; 2026 {organization.name}. Powered by <strong className={isLight ? "text-slate-700" : "text-slate-400"}>EventsPlug</strong>.</span>
          <span className="flex gap-4">
            <Link href="/" className="hover:underline">EventsPlug Home</Link>
            <Link href="/portal" className="hover:underline">Organizer Sign In</Link>
          </span>
        </div>
      </div>
    </main>
  );
}
