"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useThemes, Theme } from "@/hooks/useThemes";
import { useEvents } from "@/hooks/useEvents";
import RegistrationForm from "@/components/RegistrationForm";

export default function ThemesTab() {
  const { user, adminTheme } = useAuth();
  const { events } = useEvents();
  const {
    themes,
    isLoadingThemes,
    setOrgDefaultTheme,
    setEventThemeOverride,
    purchaseTheme,
    isPurchasing,
    updateOrgPreferences,
  } = useThemes();

  // Local Previews / Selections
  const [previewThemeId, setPreviewThemeId] = useState<string>("midnight");
  const [previewMode, setPreviewMode] = useState<"feed" | "registration">("feed");
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Premium checkout states
  const [checkoutTheme, setCheckoutTheme] = useState<Theme | null>(null);
  const [cardHolder, setCardHolder] = useState("Jane Doe");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCVC, setCardCVC] = useState("888");

  // Sync initial selections
  useEffect(() => {
    if (user?.defaultThemeId) {
      setPreviewThemeId(user.defaultThemeId);
    } else if (themes.length > 0) {
      setPreviewThemeId(themes[0].id);
    }
  }, [user, themes]);

  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const handleSetOrgDefaultTheme = async (themeId: string) => {
    const targetTheme = themes.find((t) => t.id === themeId);
    // If premium theme is selected, check if it requires checkout (if not unlocked)
    // For demo purposes, if it's premium, we prompt checkout modal
    if (targetTheme?.isPremium) {
      setCheckoutTheme(targetTheme);
      return;
    }
    await setOrgDefaultTheme(themeId);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutTheme) return;
    try {
      await purchaseTheme({
        themeId: checkoutTheme.id,
        cardHolder,
        cardNumber,
        cardExpiry,
        cardCVC,
      });
      // Set as default theme on success
      await setOrgDefaultTheme(checkoutTheme.id);
      setCheckoutTheme(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoadingThemes) {
    return (
      <div className="py-20 text-center text-text-secondary text-sm font-semibold animate-pulse">
        Retrieving organization widget styles...
      </div>
    );
  }

  // Find preview theme object
  const selTheme = themes.find((t) => t.id === previewThemeId || t.slug === previewThemeId) || themes[0];
  let variables = selTheme?.cssVariables || {
    "--primary-color": "#6366f1",
    "--bg-color": "#0d1321",
    "--text-color": "#f8fafc",
    "--card-bg": "#1e293b",
  };

  // If the widget theme is magic-adaptive, mock color harvesting from the active dashboard theme!
  if (selTheme?.slug === "magic-adaptive") {
    if (adminTheme === "light") {
      variables = {
        "--primary-color": "#2563eb", // blue-600
        "--bg-color": "#ffffff",
        "--text-color": "#09090b",
        "--card-bg": "rgba(0, 0, 0, 0.03)",
      };
    } else {
      variables = {
        "--primary-color": "#6366f1", // indigo-500
        "--bg-color": "#09090b",
        "--text-color": "#fafafa",
        "--card-bg": "rgba(255, 255, 255, 0.04)",
      };
    }
  }

  const isBgDark = !variables["--bg-color"] || getPrimaryContrast(variables["--bg-color"]) === "#ffffff";

  const containerStyles = {
    backgroundColor: variables["--bg-color"] || "#0d1321",
    color: variables["--text-color"] || "#f8fafc",
  } as React.CSSProperties;

  const cardStyles = {
    backgroundColor: variables["--card-bg"] === "#111827" || variables["--card-bg"] === "#1e293b" || !variables["--card-bg"]
      ? (isBgDark ? "rgba(255, 255, 255, 0.045)" : "rgba(0, 0, 0, 0.03)")
      : variables["--card-bg"],
    borderColor: isBgDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
  } as React.CSSProperties;

  function getPrimaryContrast(colorStr?: string): string {
    if (!colorStr) return "#ffffff";
    try {
      if (typeof window !== "undefined") {
        const temp = document.createElement("div");
        temp.style.color = colorStr;
        document.body.appendChild(temp);
        const computed = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);
        const matches = computed.match(/\d+/g);
        if (matches && matches.length >= 3) {
          const r = parseInt(matches[0]);
          const g = parseInt(matches[1]);
          const b = parseInt(matches[2]);
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          return brightness < 128 ? "#ffffff" : "#0f172a";
        }
      }
    } catch (e) {
      console.error(e);
    }
    return "#ffffff";
  }

  const primaryContrast = getPrimaryContrast(variables["--primary-color"]);

  const primaryStyles = {
    backgroundColor: variables["--primary-color"] || "#6366f1",
    color: primaryContrast,
  } as React.CSSProperties;

  // Mock Events for rendering feeds
  const mockEventsList = [
    {
      id: "mock-1",
      title: "Valorant Arena Championship 2026",
      description: "Assemble your elite squad and battle for eternal glory and a cash bounty! All matches streamed live.",
      date: "📅 May 28, 2026 • 6:00 PM",
      location: "📍 Esports Arena NYC",
      registered: 45,
      capacity: 100,
      isSoldOut: false,
      accentGradient: "from-blue-600 to-indigo-900",
    },
    {
      id: "mock-2",
      title: "Web3 Developers Summit & Bounties",
      description: "Discover state-of-the-art decentralized tech, participate in speed hackathons, and connect with engineers.",
      date: "📅 June 15, 2026 • 9:00 AM",
      location: "📍 Crypto Hub SF",
      registered: 120,
      capacity: 120,
      isSoldOut: true,
      accentGradient: "from-purple-600 to-pink-900",
    },
    {
      id: "mock-3",
      title: "Global Venture Pitch Night",
      description: "Secure funding for your game-changing ideas. Pitch directly to tier-1 venture funds and angel networks.",
      date: "📅 July 04, 2026 • 7:00 PM",
      location: "📍 Innovation Garage London",
      registered: 80,
      capacity: 150,
      isSoldOut: false,
      accentGradient: "from-emerald-600 to-teal-900",
    },
  ];

  const activeLayout = user?.defaultLayout || "GRID";
  const displayLimit = user?.defaultLimit || 3;
  const displayEvents = mockEventsList.slice(0, displayLimit);

  // Active form fields for registration preview
  const previewEvent = events.find((e) => e.id === selectedEventId) || events[0];
  const editingFields = (previewEvent?.formFields ?? previewEvent?.customFields) || [
    { id: "f1", label: "Full Name", type: "TEXT", required: true, order: 1 },
    { id: "f2", label: "Email Address", type: "EMAIL", required: true, order: 2 },
    { id: "f3", label: "Developer Experience (Years)", type: "NUMBER", required: false, order: 3 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header block */}
      <div className="flex justify-between items-center pb-4 border-b border-border-main/50">
        <div>
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 font-display">
            Organization Widget Themes
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Customize the styling, typography, and visual accents of registration widgets embedded on your host sites.
          </p>
        </div>
      </div>

      {/* Grid split: Left Controls, Right Preview Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left controls: 5-span */}
        <div className="lg:col-span-5 space-y-8">
          {/* Section 1: Default theme & Visual layout */}
          <div className="space-y-6 pb-6 border-b border-border-main/40">
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">
                Default Organization Theme
              </h4>
              <p className="text-xs text-text-secondary">
                Set the default style preference. Newly created events inherit this style automatically.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                  Default Brand Theme
                </label>
                <select
                  value={user?.defaultThemeId || "midnight"}
                  onChange={(e) => handleSetOrgDefaultTheme(e.target.value)}
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition cursor-pointer"
                >
                  {themes.map((t) => (
                    <option key={t.id} value={t.id} className="bg-bg-panel text-text-primary">
                      {t.name} {t.slug === "magic-adaptive" ? "(Auto-Harvests host page colors)" : ""} {t.isPremium ? "💎" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                  Default Visual Layout
                </label>
                <div className="flex gap-1.5 p-1 rounded-xl bg-bg-panel/40 border border-border-main">
                  {[
                    { id: "GRID", label: "Grid Feed" },
                    { id: "LIST", label: "List Feed" },
                    { id: "CAROUSEL", label: "Carousel" },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => updateOrgPreferences({ layout: l.id, limit: user?.defaultLimit !== undefined ? user.defaultLimit : null })}
                      className={`flex-1 py-2 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        (user?.defaultLayout || "GRID") === l.id
                          ? "bg-bg-panel border border-border-main text-text-primary shadow-sm"
                          : "text-text-secondary hover:text-text-primary border border-transparent"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                  Display Events Limit
                </label>
                <select
                  value={user?.defaultLimit === null || user?.defaultLimit === undefined ? "all" : String(user.defaultLimit)}
                  onChange={(e) => {
                    const val = e.target.value === "all" ? null : parseInt(e.target.value, 10);
                    updateOrgPreferences({ layout: user?.defaultLayout || "GRID", limit: val });
                  }}
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition font-medium cursor-pointer"
                >
                  <option value="all" className="bg-bg-panel text-text-primary">Show All Active Events</option>
                  <option value="1" className="bg-bg-panel text-text-primary">1 Event Card Only</option>
                  <option value="2" className="bg-bg-panel text-text-primary">2 Event Cards Max</option>
                  <option value="3" className="bg-bg-panel text-text-primary">3 Event Cards Max</option>
                  <option value="5" className="bg-bg-panel text-text-primary">5 Event Cards Max</option>
                  <option value="10" className="bg-bg-panel text-text-primary">10 Event Cards Max</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Event overrides list */}
          {events.length > 0 && (
            <div className="space-y-4 pb-6 border-b border-border-main/40">
              <div>
                <h4 className="text-sm font-bold text-text-primary mb-1">
                  Event-Specific Overrides
                </h4>
                <p className="text-xs text-text-secondary">
                  Apply visual style overrides to specific events to override default settings.
                </p>
              </div>

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {events.map((evt) => (
                  <div key={evt.id} className="p-3 bg-bg-panel/20 border border-border-main/60 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-text-primary block truncate">{evt.title}</span>
                      <span className="text-[9px] font-mono text-text-secondary block truncate">{evt.slug}</span>
                    </div>
                    <select
                      value={evt.themeId || ""}
                      onChange={(e) => setEventThemeOverride({ eventId: evt.id, themeId: e.target.value || null })}
                      className="bg-bg-panel-alt border border-border-main rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-text-primary focus:outline-none focus:border-accent-primary transition cursor-pointer max-w-[150px]"
                    >
                      <option value="" className="bg-bg-panel text-text-primary">Inherit default ({themes.find(t => t.id === user?.defaultThemeId || t.slug === user?.defaultThemeId)?.name || "Midnight"})</option>
                      {themes.map((t) => (
                        <option key={t.id} value={t.id} className="bg-bg-panel text-text-primary">
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Available Themes Gallery */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">
                Available Brand Presets
              </h4>
              <p className="text-xs text-text-secondary">
                Select a theme preset to preview it live.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => setPreviewThemeId(theme.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                    previewThemeId === theme.id
                      ? "bg-accent-primary/10 border-accent-primary/40 shadow-sm"
                      : "bg-bg-panel/20 border-border-main hover:border-slate-700/85"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-text-primary block flex items-center gap-1.5">
                      {theme.name}
                      {theme.isPremium && <span className="text-[10px] text-accent-primary font-extrabold uppercase">Premium</span>}
                    </span>
                    <span className="text-[10px] font-mono text-text-secondary block">{theme.slug}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {theme.slug === "magic-adaptive" ? (
                      <span className="text-[9px] text-accent-primary font-medium italic">Adaptive</span>
                    ) : (
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full border border-slate-800 shadow" style={{ backgroundColor: theme.cssVariables?.["--primary-color"] }} title="Primary" />
                        <span className="w-3 h-3 rounded-full border border-slate-800 shadow" style={{ backgroundColor: theme.cssVariables?.["--bg-color"] }} title="Background" />
                        <span className="w-3 h-3 rounded-full border border-slate-800 shadow" style={{ backgroundColor: theme.cssVariables?.["--card-bg"] }} title="Card BG" />
                      </div>
                    )}
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      previewThemeId === theme.id ? "border-accent-primary bg-accent-primary" : "border-border-main bg-transparent"
                    }`}>
                      {previewThemeId === theme.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Preview Canvas: 7-span */}
        <div className="lg:col-span-7 space-y-6 font-sans">
          {/* Selector tab row & Dual Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-bg-panel/40 border border-border-main/50 shadow-md">
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode("feed")}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border cursor-pointer ${
                  previewMode === "feed"
                    ? "bg-bg-panel text-text-primary border-border-main shadow-sm"
                    : "text-text-secondary border-transparent hover:text-text-primary"
                }`}
              >
                Events Feed Preview
              </button>
              <button
                onClick={() => setPreviewMode("registration")}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border cursor-pointer ${
                  previewMode === "registration"
                    ? "bg-bg-panel text-text-primary border-border-main shadow-sm"
                    : "text-text-secondary border-transparent hover:text-text-primary"
                }`}
              >
                Form Registration Preview
              </button>
            </div>

            <div className="flex gap-1 bg-bg-panel-alt p-1 rounded-xl border border-border-main max-w-full overflow-x-auto scrollbar-none">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setPreviewThemeId(theme.id)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    previewThemeId === theme.id
                      ? "bg-accent-primary text-white shadow shadow-accent-primary/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-panel-hover"
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Dynamic Preview Mockup Container */}
          <div
            style={containerStyles}
            className="preview-shell rounded-3xl border border-border-main/60 p-8 shadow-2xl transition-all duration-300 relative overflow-hidden min-h-[580px] flex flex-col justify-between"
          >
            {/* Mesh gradient decor background */}
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-[0.08] blur-[80px]"
              style={primaryStyles}
            />

            {/* Top Mock URL Bar */}
            <div className={`absolute top-0 left-0 right-0 h-9 flex items-center px-4 justify-between select-none z-20 ${
              isBgDark 
                ? "bg-black/40 border-b border-white/5" 
                : "bg-slate-100 border-b border-slate-200/80"
            }`}>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              </div>
              <div className={`text-[9px] font-mono px-6 py-0.5 rounded-full truncate max-w-[320px] ${
                isBgDark 
                  ? "text-slate-400 bg-black/30 border border-white/5" 
                  : "text-slate-600 bg-white border border-slate-200"
              }`}>
                {previewMode === "feed"
                  ? `https://eventsplug.com/embed/${user?.organizationSlug || "org"}?layout=${activeLayout.toLowerCase()}`
                  : `https://eventsplug.com/embed/${user?.organizationSlug || "org"}?event=developer-con-2026`}
              </div>
              <div className="w-4"></div>
            </div>

            {/* Interactive content based on preview mode */}
            {previewMode === "feed" ? (
              /* EVENTS FEED VISUAL VIEWER */
              <div className="mt-8 flex-1 flex flex-col justify-start w-full overflow-y-auto max-h-[460px] pr-1 space-y-4">
                <div className={`flex justify-between items-center mb-1 pb-2 border-b ${
                  isBgDark ? "border-white/5" : "border-black/5"
                }`}>
                  <span className={`text-[10px] uppercase font-black tracking-widest ${
                    isBgDark ? "text-white/60" : "text-black/60"
                  }`}>
                    📂 Embedded Events Feed (Layout: {activeLayout})
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                    isBgDark 
                      ? "bg-white/10 text-white/80" 
                      : "bg-black/5 text-black/80"
                  }`}>
                    Limit: {user?.defaultLimit || "Unlimited"}
                  </span>
                </div>

                {activeLayout === "GRID" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        style={cardStyles}
                        className="rounded-2xl border p-4 shadow-lg flex flex-col justify-between space-y-3.5 relative overflow-hidden"
                      >
                        {/* Event poster placeholder */}
                        <div className={`h-24 rounded-xl bg-gradient-to-br ${evt.accentGradient} flex items-center justify-center relative overflow-hidden`}>
                          <span className="text-xs font-black uppercase text-white/95 tracking-wide text-center px-4">
                            {evt.title}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xs font-black line-clamp-1">{evt.title}</h5>
                          <p className="text-[10px] opacity-75 line-clamp-2 leading-relaxed">{evt.description}</p>
                        </div>
                        <div className="text-[9px] opacity-60 space-y-1">
                          <div>{evt.date}</div>
                          <div>{evt.location}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] opacity-70 font-bold">
                              <span>Capacity</span>
                              <span>{evt.registered} / {evt.capacity} Filled</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${evt.isSoldOut ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
                                style={{ width: `${(evt.registered / evt.capacity) * 100}%` }}
                              />
                            </div>
                          </div>
                          <button
                            style={evt.isSoldOut ? undefined : primaryStyles}
                            className={`w-full text-[10px] font-black py-2 rounded-lg text-center cursor-default select-none border transition ${
                              evt.isSoldOut 
                                ? isBgDark 
                                  ? "bg-white/10 text-white/40 border-white/5" 
                                  : "bg-black/5 text-black/40 border-black/5"
                                : "border-transparent opacity-90"
                            }`}
                          >
                            {evt.isSoldOut ? "Sold Out" : "Register Seat"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeLayout === "LIST" && (
                  <div className="flex flex-col gap-3">
                    {displayEvents.map((evt) => (
                      <div
                        key={evt.id}
                        style={cardStyles}
                        className="rounded-2xl border p-4 shadow flex flex-col md:flex-row items-center gap-4 text-left relative"
                      >
                        <div className={`w-full md:w-28 h-20 rounded-xl bg-gradient-to-br ${evt.accentGradient} flex items-center justify-center flex-shrink-0 relative overflow-hidden`}>
                          <span className="text-[9px] font-black uppercase text-white/90 text-center px-2">
                            {evt.title.substring(0, 3)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <h5 className="text-xs font-black truncate">{evt.title}</h5>
                          <p className="text-[9px] opacity-75 line-clamp-1 leading-normal">{evt.description}</p>
                          <div className="flex gap-3 text-[8px] opacity-60 font-medium">
                            <span>{evt.date}</span>
                            <span>{evt.location}</span>
                          </div>
                        </div>
                        <div className="w-full md:w-44 flex-shrink-0 flex flex-col justify-center space-y-2 border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0 md:pl-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] opacity-70 font-bold">
                              <span>Capacity</span>
                              <span>{evt.registered}/{evt.capacity}</span>
                            </div>
                            <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${evt.isSoldOut ? "bg-red-500" : "bg-indigo-500"}`}
                                style={{ width: `${(evt.registered / evt.capacity) * 100}%` }}
                              />
                            </div>
                          </div>
                          <button
                            style={evt.isSoldOut ? undefined : primaryStyles}
                            className={`w-full text-[9px] font-black py-1.5 rounded-lg text-center cursor-default select-none border transition ${
                              evt.isSoldOut 
                                ? isBgDark 
                                  ? "bg-white/10 text-white/40 border-white/5" 
                                  : "bg-black/5 text-black/40 border-black/5"
                                : "border-transparent opacity-95"
                            }`}
                          >
                            {evt.isSoldOut ? "Sold Out" : "Register"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeLayout === "CAROUSEL" && (
                  <div className="relative w-full">
                    <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2">
                      {displayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          style={{ ...cardStyles, flex: "0 0 240px" }}
                          className="rounded-2xl border p-4 shadow-lg flex flex-col justify-between space-y-4 snap-start relative overflow-hidden"
                        >
                          <div className={`h-24 rounded-xl bg-gradient-to-br ${evt.accentGradient} flex items-center justify-center relative overflow-hidden`}>
                            <span className="text-[10px] font-black uppercase text-white/95 text-center px-4">
                              {evt.title}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h5 className="text-xs font-black line-clamp-1">{evt.title}</h5>
                            <p className="text-[9px] opacity-75 line-clamp-2 leading-relaxed">{evt.description}</p>
                          </div>
                          <div className="space-y-2 pt-1 border-t border-white/5">
                            <div className="space-y-1">
                              <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${evt.isSoldOut ? "bg-red-500" : "bg-indigo-500"}`}
                                  style={{ width: `${(evt.registered / evt.capacity) * 100}%` }}
                                />
                              </div>
                            </div>
                            <button
                              style={evt.isSoldOut ? undefined : primaryStyles}
                              className={`w-full text-[9px] font-black py-1.5 rounded-lg text-center cursor-default select-none border transition ${
                                evt.isSoldOut 
                                  ? isBgDark 
                                    ? "bg-white/10 text-white/40 border-white/5" 
                                    : "bg-black/5 text-black/40 border-black/5"
                                  : "border-transparent opacity-90"
                              }`}
                            >
                              {evt.isSoldOut ? "Sold Out" : "Register Seat"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* FORM REGISTRATION PREMIUM VISUAL PREVIEWER */
              <div className="mt-8 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <div style={cardStyles} className="rounded-2xl border p-6 shadow-xl space-y-5">
                  <div className="h-32 rounded-xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-white/5 overflow-hidden flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="text-center z-10 p-4">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block mb-1">Live Registration Widget</span>
                      <h5 className="text-sm font-bold text-white">Fullstack Developer Conference 2026</h5>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px] opacity-70 border-b border-current/10 pb-4">
                    <div>📅 May 28, 2026 • 9:00 AM</div>
                    <div className="text-right">📍 Silicon Valley Center</div>
                  </div>

                  <RegistrationForm
                    event={{
                      id: previewEvent?.id || "preview-id",
                      title: previewEvent?.title || "Fullstack Developer Conference 2026",
                      formFields: editingFields as any,
                    }}
                    preview={true}
                    primaryColor={variables["--primary-color"] || "#6366f1"}
                    cardBg={variables["--card-bg"] || "#1e293b"}
                    textColor={variables["--text-color"] || "#f8fafc"}
                  />
                </div>
              </div>
            )}

            {/* Theme variables spec banner */}
            <div className={`text-[10px] font-mono pt-4 mt-6 border-t flex justify-between items-center ${
              isBgDark ? "text-slate-500 border-white/5" : "text-slate-600 border-black/5"
            }`}>
              <span>Aesthetic Theme: <strong className={isBgDark ? "text-slate-350" : "text-slate-800"}>{selTheme?.name}</strong></span>
              <span>Contrast: <strong className="text-emerald-500 font-extrabold">Passes AAA 🏆</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Unlock Checkout Modal */}
      {checkoutTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-bg-panel border border-border-main rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <div className="flex justify-between items-start pb-4 border-b border-border-main/20 mb-5">
              <div>
                <h4 className="text-md font-bold text-text-primary flex items-center gap-1.5">
                  💎 Unlock Premium Widget Style
                </h4>
                <p className="text-xs text-text-secondary mt-1">
                  You are unlocking: <span className="font-bold text-accent-primary">{checkoutTheme.name}</span> for your organization.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutTheme(null)}
                className="text-text-secondary hover:text-text-primary text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-xl text-center mb-2">
                <span className="text-[10px] uppercase font-bold text-accent-primary block tracking-widest">One-time payment</span>
                <span className="text-2xl font-black text-text-primary mt-1 block">${checkoutTheme.price || "9.99"}</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Security Code (CVC)
                  </label>
                  <input
                    type="text"
                    required
                    value={cardCVC}
                    onChange={(e) => setCardCVC(e.target.value)}
                    className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCheckoutTheme(null)}
                  className="flex-1 py-3 bg-bg-panel/40 border border-border-main hover:bg-bg-panel-hover text-text-secondary rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPurchasing}
                  className="flex-1 py-3 bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-accent-primary/30 flex justify-center items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isPurchasing ? "Processing..." : `Pay $${checkoutTheme.price || "9.99"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
