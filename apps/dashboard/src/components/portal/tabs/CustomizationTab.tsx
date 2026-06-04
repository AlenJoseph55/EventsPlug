"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useHubCustomization, HubCustomizationData } from "@/hooks/useHubCustomization";
import { useThemes } from "@/hooks/useThemes";
import { getContrastAdjustedColor } from "@/lib/color-utils";

export default function CustomizationTab() {
  const { user, adminTheme } = useAuth();
  const { themes } = useThemes();
  const {
    customization,
    isLoading: loadingCustomization,
    saveCustomization,
    isSaving: savingCustomization,
    uploadImage,
  } = useHubCustomization();

  // Local Form States
  const [hubTitle, setHubTitle] = useState("");
  const [hubDescription, setHubDescription] = useState("");
  const [hubLogoUrl, setHubLogoUrl] = useState("");
  const [hubIcon, setHubIcon] = useState("🏫");
  const [showCardDate, setShowCardDate] = useState(true);
  const [showCardLocation, setShowCardLocation] = useState(true);
  const [showCardCapacity, setShowCardCapacity] = useState(true);
  const [hubLayout, setHubLayout] = useState<"GRID" | "LIST" | "CAROUSEL">("GRID");
  const [hubThemeId, setHubThemeId] = useState("");
  const [hubAccentColor, setHubAccentColor] = useState("#6366f1");
  const [hubBgColor, setHubBgColor] = useState("#090d16");
  const [hubBannerUrl, setHubBannerUrl] = useState("");
  const [hubThemeStyle, setHubThemeStyle] = useState("DOT_MATRIX");
  const [autoFitImages, setAutoFitImages] = useState(true);

  // Preview options
  const [previewThemeMode, setPreviewThemeMode] = useState<"dark" | "light">("dark");
  const [uploadingHubLogo, setUploadingHubLogo] = useState(false);
  const [uploadingHubBanner, setUploadingHubBanner] = useState(false);

  // Sync preview theme mode with active admin dashboard theme
  useEffect(() => {
    if (adminTheme) {
      setPreviewThemeMode(adminTheme);
    }
  }, [adminTheme]);

  // Sync form states from customization queries
  useEffect(() => {
    if (customization) {
      setHubTitle(customization.hubTitle || "");
      setHubDescription(customization.hubDescription || "");
      setHubLogoUrl(customization.hubLogoUrl || "");
      setHubIcon(customization.hubIcon || "🏫");
      setShowCardDate(customization.showCardDate !== false);
      setShowCardLocation(customization.showCardLocation !== false);
      setShowCardCapacity(customization.showCardCapacity !== false);
      setHubLayout(customization.hubLayout || "GRID");
      setHubThemeId(customization.hubThemeId || "");
      setHubAccentColor(customization.hubAccentColor || "#6366f1");
      setHubBgColor(customization.hubBgColor || "#090d16");
      setHubBannerUrl(customization.hubBannerUrl || "");
      setHubThemeStyle(customization.hubThemeStyle || "DOT_MATRIX");
      setAutoFitImages(customization.autoFitImages !== false);
    }
  }, [customization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCustomization({
      hubTitle,
      hubDescription,
      hubLogoUrl: hubLogoUrl || null,
      hubIcon,
      showCardDate,
      showCardLocation,
      showCardCapacity,
      hubLayout,
      hubThemeId: hubThemeId || null,
      hubAccentColor: hubAccentColor || null,
      hubBgColor: hubBgColor || null,
      hubBannerUrl: hubBannerUrl || null,
      hubThemeStyle,
      autoFitImages,
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHubLogo(true);
    try {
      const url = await uploadImage(file);
      setHubLogoUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingHubLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHubBanner(true);
    try {
      const url = await uploadImage(file);
      setHubBannerUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingHubBanner(false);
    }
  };

  if (loadingCustomization) {
    return (
      <div className="py-20 text-center text-text-secondary text-sm font-semibold animate-pulse">
        Retrieving your hub customization settings...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header block */}
      <div className="flex justify-between items-center pb-4 border-b border-border-main/50">
        <div>
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 font-display">
            Standalone Hub Customizer
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Configure the design, brand elements, and display properties of your organization's public events page.
          </p>
        </div>
        <div>
          <a
            href={`/o/${user?.organizationSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/20 hover:border-accent-primary/40 text-accent-primary hover:text-accent-primary/95 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            View Standalone Page
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form inputs */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Brand & Header Info */}
          <div className="space-y-5 pb-6 border-b border-border-main/50">
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">
                Brand & Header Information
              </h4>
              <p className="text-xs text-text-secondary">
                Configure the header text, logo, and welcome message displayed on your public page.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Hub Welcome Title
                </label>
                <input
                  type="text"
                  required
                  value={hubTitle}
                  onChange={(e) => setHubTitle(e.target.value)}
                  placeholder="e.g. Annual Summit Directory"
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-primary transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Hub Welcome Description
                </label>
                <textarea
                  rows={3}
                  value={hubDescription}
                  onChange={(e) => setHubDescription(e.target.value)}
                  placeholder="e.g. Welcome to our hub registry. Click on any active event to register."
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-primary transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Hub Logo Image
                  </label>
                  
                  {/* File Input for Upload */}
                  <div className="relative flex items-center justify-center border border-dashed border-border-main hover:border-text-secondary rounded-xl p-4 bg-bg-panel/20 transition group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <span className="text-xs font-bold text-text-primary block mb-1 group-hover:text-accent-primary transition">
                        {uploadingHubLogo ? "Uploading file..." : "Click to upload logo"}
                      </span>
                      <span className="text-[10px] text-text-secondary block">PNG, JPG, SVG up to 2MB</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-border-main/55 flex-1" />
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Or</span>
                    <div className="h-px bg-border-main/55 flex-1" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                      Hub Logo URL
                    </label>
                    <input
                      type="url"
                      value={hubLogoUrl}
                      onChange={(e) => setHubLogoUrl(e.target.value || "")}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">
                    Hub Header Icon Emoji
                  </label>
                  <select
                    value={hubIcon}
                    onChange={(e) => setHubIcon(e.target.value)}
                    className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition cursor-pointer"
                  >
                    <option value="🏫" className="bg-bg-panel text-text-primary">School/Academy</option>
                    <option value="🚀" className="bg-bg-panel text-text-primary">Tech/Startup</option>
                    <option value="📅" className="bg-bg-panel text-text-primary">Event/Calendar</option>
                    <option value="🎯" className="bg-bg-panel text-text-primary">Sports/Competitions</option>
                    <option value="🎨" className="bg-bg-panel text-text-primary">Creative/Art</option>
                    <option value="👥" className="bg-bg-panel text-text-primary">Community/Meetup</option>
                    <option value="🏢" className="bg-bg-panel text-text-primary">Business/Enterprise</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Layout & Theme Preferences */}
          <div className="space-y-5 pb-6 border-b border-border-main/50">
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">
                Layout & Theme Preferences
              </h4>
              <p className="text-xs text-text-secondary">
                Configure layout style and theme presets specifically for your Standalone Hub directory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Hub Layout Style
                </label>
                <div className="flex gap-1.5 p-1 rounded-xl bg-bg-panel/40 border border-border-main">
                  {[
                    { id: "GRID", label: "Grid Layout" },
                    { id: "LIST", label: "List Layout" },
                    { id: "CAROUSEL", label: "Carousel" },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setHubLayout(l.id as any)}
                      className={`flex-1 py-2 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        hubLayout === l.id
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
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Hub Theme Presets
                </label>
                <select
                  value={hubThemeId}
                  onChange={(e) => setHubThemeId(e.target.value)}
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition cursor-pointer"
                >
                  <option value="" className="bg-bg-panel text-text-primary">Use Global Default Theme</option>
                  {themes.map((theme) => (
                    <option key={theme.id} value={theme.id} className="bg-bg-panel text-text-primary">
                      {theme.name} {theme.isPremium ? "💎" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Card Appearance & Controls */}
          <div className="space-y-5 pb-6 border-b border-border-main/50">
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">
                Card Appearance & Context
              </h4>
              <p className="text-xs text-text-secondary">
                Choose which contextual properties should be rendered on each event listing card in the public directory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3 rounded-xl bg-bg-panel/20 border border-border-main hover:bg-bg-panel/40 transition cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary block">Show Event Date</span>
                  <span className="text-[10px] text-text-secondary">Render the calendar icon and date details.</span>
                </div>
                <input
                  type="checkbox"
                  checked={showCardDate}
                  onChange={(e) => setShowCardDate(e.target.checked)}
                  className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary border-border-main bg-bg-panel-alt cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-bg-panel/20 border border-border-main hover:bg-bg-panel/40 transition cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary block">Show Event Location</span>
                  <span className="text-[10px] text-text-secondary">Render the map-pin icon and location description.</span>
                </div>
                <input
                  type="checkbox"
                  checked={showCardLocation}
                  onChange={(e) => setShowCardLocation(e.target.checked)}
                  className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary border-border-main bg-bg-panel-alt cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-bg-panel/20 border border-border-main hover:bg-bg-panel/40 transition cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary block">Show Capacity Status</span>
                  <span className="text-[10px] text-text-secondary">Render current seating progress bar and limit text.</span>
                </div>
                <input
                  type="checkbox"
                  checked={showCardCapacity}
                  onChange={(e) => setShowCardCapacity(e.target.checked)}
                  className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary border-border-main bg-bg-panel-alt cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-bg-panel/20 border border-border-main hover:bg-bg-panel/40 transition cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary block">Auto-Fit Cover Images</span>
                  <span className="text-[10px] text-text-secondary">Render cover images at their natural size ratio without cropping.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoFitImages}
                  onChange={(e) => setAutoFitImages(e.target.checked)}
                  className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary border-border-main bg-bg-panel-alt cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 4: Theme Branding */}
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-1">
                Theme Branding & Accents
              </h4>
              <p className="text-xs text-text-secondary">
                Customize your public directory page by choosing a brand accent color and uploading a header cover banner.
              </p>
            </div>

            {/* Brand Accent Color */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                Brand Accent Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={hubAccentColor}
                  onChange={(e) => setHubAccentColor(e.target.value)}
                  className="w-12 h-10 rounded-xl bg-transparent border border-border-main cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  maxLength={7}
                  value={hubAccentColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith("#") || val.length === 0) {
                      setHubAccentColor(val);
                    } else {
                      setHubAccentColor("#" + val);
                    }
                  }}
                  className="w-32 bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-accent-primary font-mono focus:outline-none focus:border-accent-primary transition"
                  placeholder="#6366f1"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setHubAccentColor(c)}
                      className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition shadow-sm cursor-pointer"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Background Color */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                Custom Background Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={hubBgColor || "#090d16"}
                  onChange={(e) => setHubBgColor(e.target.value)}
                  className="w-12 h-10 rounded-xl bg-transparent border border-border-main cursor-pointer overflow-hidden p-0"
                />
                <input
                  type="text"
                  maxLength={7}
                  value={hubBgColor || "#090d16"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith("#") || val.length === 0) {
                      setHubBgColor(val);
                    } else {
                      setHubBgColor("#" + val);
                    }
                  }}
                  className="w-32 bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-accent-primary font-mono focus:outline-none focus:border-accent-primary transition"
                  placeholder="#090d16"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {["#090d16", "#0f172a", "#18181b", "#1e1b4b", "#111827", "#172554"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setHubBgColor(c)}
                      className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition shadow-sm cursor-pointer"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Background Backdrop Style */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                Background Backdrop Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: "DOT_MATRIX",
                    name: "Dot Matrix",
                    desc: "Quiet grid dot overlay",
                    previewContent: (
                      <div className="preview-shell w-full h-8 rounded bg-slate-950 relative overflow-hidden mb-1.5 border border-slate-900/60 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '6px 6px' }} />
                        <span className="text-[8px] text-slate-550 font-mono relative z-10">Matrix</span>
                      </div>
                    )
                  },
                  {
                    id: "GRID_WARP",
                    name: "Warp Grid",
                    desc: "Animated mesh spotlight",
                    previewContent: (
                      <div className="preview-shell w-full h-8 rounded bg-slate-950 relative overflow-hidden mb-1.5 border border-slate-900/60 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full blur-md opacity-30" style={{ backgroundColor: hubAccentColor || '#6366f1' }} />
                        <span className="text-[8px] text-slate-550 font-mono relative z-10">Warp</span>
                      </div>
                    )
                  },
                  {
                    id: "AURORA_GLOW",
                    name: "Aurora Glow",
                    desc: "Ambient moving glows",
                    previewContent: (
                      <div className="preview-shell w-full h-8 rounded bg-slate-950 relative overflow-hidden mb-1.5 border border-slate-900/60 flex items-center justify-center">
                        <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full blur-md opacity-25" style={{ backgroundColor: hubAccentColor || '#6366f1' }} />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full blur-md opacity-20" style={{ backgroundColor: '#ec4899' }} />
                        <span className="text-[8px] text-slate-550 font-mono relative z-10">Aurora</span>
                      </div>
                    )
                  }
                ].map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setHubThemeStyle(style.id)}
                    className={`bg-slate-950 border rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-slate-700 ${
                      hubThemeStyle === style.id 
                        ? "border-accent-primary ring-2 ring-accent-primary/20 shadow-sm" 
                        : "border-slate-800/80"
                    }`}
                  >
                    {style.previewContent}
                    <span className="text-[10px] font-bold text-slate-200 block truncate w-full">{style.name}</span>
                    <span className="text-[8px] text-slate-500 block truncate w-full mt-0.5 leading-tight">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Banner Image */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                Header Cover Banner
              </label>
              
              {hubBannerUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-border-main bg-bg-panel/20 p-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-10 rounded-lg bg-cover bg-center border border-white/5" 
                      style={{ backgroundImage: `url(${hubBannerUrl})` }}
                    />
                    <span className="text-[10px] font-mono text-text-secondary truncate max-w-[120px]">
                      {hubBannerUrl.substring(hubBannerUrl.lastIndexOf("/") + 1)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHubBannerUrl("")}
                    className="px-2.5 py-1.5 bg-danger-bg/25 hover:bg-danger-bg/60 border border-danger-border text-danger-text hover:text-white rounded-lg text-[9px] font-bold transition cursor-pointer"
                  >
                    Remove Cover
                  </button>
                </div>
              ) : (
                <div className="relative border border-dashed border-border-main hover:border-text-secondary rounded-xl p-6 text-center transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={uploadingHubBanner}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-text-primary block">
                      {uploadingHubBanner ? "Uploading banner cover..." : "Upload header cover banner"}
                    </span>
                    <span className="text-[9px] text-text-secondary block">
                      PNG, JPG, or WEBP cover image. Max 5MB.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={savingCustomization}
              className="px-6 py-3 bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition shadow-lg shadow-accent-primary/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {savingCustomization ? "Saving Settings..." : "Save Customization"}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Mockup / Live Preview */}
        {(() => {
          const isLight = previewThemeMode === "light";
          const contrastBg = isLight ? "#f8fafc" : (hubBgColor || "#090d16");
          const adjustedAccentColor = getContrastAdjustedColor(hubAccentColor, contrastBg);
          const mockCardBg = isLight ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.045)";
          const mockCardBorder = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.08)";
          let mockupBgStyle: React.CSSProperties = {
            backgroundColor: contrastBg,
          };

          const gridLineColor = isLight ? "0, 0, 0" : "255, 255, 255";
          const gridOpacity = isLight ? "0.04" : "0.04";

          if (hubThemeStyle === "GRID_WARP") {
            mockupBgStyle = {
              backgroundImage: `radial-gradient(circle at center, ${adjustedAccentColor}${isLight ? '08' : '15'} 0%, transparent 70%), radial-gradient(rgba(${gridLineColor}, ${gridOpacity}) 1px, transparent 1px)`,
              backgroundSize: '100% 100%, 8px 8px',
              backgroundColor: contrastBg,
            };
          } else if (hubThemeStyle === "DOT_MATRIX") {
            mockupBgStyle = {
              backgroundImage: `radial-gradient(rgba(${gridLineColor}, ${gridOpacity}) 1px, transparent 1px)`,
              backgroundSize: '6px 6px',
              backgroundColor: contrastBg,
            };
          }

          return (
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-bg-panel/40 border border-border-main/50 rounded-2xl p-6 shadow-md flex flex-col justify-between h-full min-h-[450px]">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                      Standalone Hub Preview
                    </h4>
                    
                    {/* Dark / Light Preview Mode Switcher */}
                    <div className="flex items-center gap-1 bg-bg-panel-alt/60 border border-border-main/80 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setPreviewThemeMode("dark")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                          previewThemeMode === "dark"
                            ? "bg-bg-panel text-text-primary border-border-main/40 shadow-sm"
                            : "text-text-secondary border-transparent hover:text-text-primary"
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewThemeMode("light")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer border ${
                          previewThemeMode === "light"
                            ? "bg-bg-panel text-text-primary border-border-main/40 shadow-sm"
                            : "text-text-secondary border-transparent hover:text-text-primary"
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary mb-6">
                    Real-time mockup of how your customized standalone landing page will appear to attendees.
                  </p>

                  {/* Interactive Screen Shell */}
                  <div 
                    className={`preview-shell border rounded-2xl p-5 space-y-6 text-center shadow-inner relative overflow-hidden transition-all duration-300 ${
                      isLight ? "border-slate-350" : "border-slate-800/80"
                    }`}
                    style={mockupBgStyle}
                  >
                    {/* Aurora Glow background orbs */}
                    {hubThemeStyle === "AURORA_GLOW" && (
                      <>
                        <div className={`absolute top-0 -left-6 w-24 h-24 rounded-full blur-xl pointer-events-none transition-all duration-500 ${isLight ? 'opacity-5' : 'opacity-20'}`} style={{ backgroundColor: adjustedAccentColor }} />
                        <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-xl pointer-events-none transition-all duration-500 ${isLight ? 'opacity-4' : 'opacity-15'}`} style={{ backgroundColor: '#ec4899' }} />
                      </>
                    )}

                    {/* Banner background blur or image mockup */}
                    {hubBannerUrl ? (
                      <div 
                        className={`absolute top-0 left-0 right-0 h-16 bg-cover bg-center border-b opacity-85 z-0 ${
                          isLight ? "border-slate-200" : "border-white/5"
                        }`}
                        style={{ backgroundImage: `url(${hubBannerUrl})` }}
                      />
                    ) : (
                      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] pointer-events-none ${
                        isLight ? "bg-accent-primary/5" : "bg-accent-primary/10"
                      }`} />
                    )}

                    {/* Logo / Icon block */}
                    <div className={`relative z-10 space-y-3 ${hubBannerUrl ? 'pt-12' : ''}`}>
                      {hubLogoUrl ? (
                        <img
                          src={hubLogoUrl}
                          alt="Hub Mockup Logo"
                          className={`mx-auto block h-10 w-auto object-contain rounded-xl p-0.5 border shadow ${
                            isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/5"
                          }`}
                        />
                      ) : (
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-lg shadow-sm ${
                          isLight
                            ? "bg-slate-100/90 border border-slate-250 text-slate-800"
                            : "bg-[#090d16]/80 backdrop-blur-md border border-white/10 text-white"
                        }`}>
                          {hubIcon || "🏫"}
                        </div>
                      )}
                      <div className="space-y-1">
                        <h5 className="font-extrabold uppercase text-xs tracking-tight">
                          {hubTitle || user?.organizationName || "Hub Directory"}
                        </h5>
                        <span className="text-[8px] font-bold uppercase tracking-wider block opacity-65">
                          Official directory • 1 Active Listing
                        </span>
                      </div>
                      <p className="text-[9px] leading-normal max-w-xs mx-auto opacity-75">
                        {hubDescription || "Welcome to our events page. Click below to register."}
                      </p>
                    </div>

                    {/* Event Card Mockup */}
                    {hubLayout === "LIST" ? (
                      <div 
                        style={{ backgroundColor: mockCardBg, borderColor: mockCardBorder }}
                        className="border rounded-xl p-3 text-left shadow-md flex items-center gap-3 max-w-sm mx-auto relative z-10"
                      >
                        <div className={`w-16 rounded-lg border flex items-center justify-center flex-shrink-0 relative overflow-hidden ${
                          autoFitImages ? 'h-14' : 'h-12'
                        } ${
                          isLight
                            ? "bg-gradient-to-br from-slate-100 to-slate-200/50 border-slate-200/60"
                            : "bg-gradient-to-br from-accent-primary/10 to-slate-900/60 border-white/5"
                        }`}>
                          <span className={`text-center font-black uppercase text-[7px] z-10 ${
                            isLight ? "text-slate-655" : "text-slate-350"
                          }`}>
                            SAM
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h6 className="text-[10px] font-black truncate">Sample Summit 2026</h6>
                          <p className="text-[8px] leading-snug truncate opacity-75">
                            An exclusive workshop event covering next-gen APIs.
                          </p>
                          <div className="flex gap-2 text-[7px] font-bold opacity-65">
                            {showCardDate && <span>📅 Jan 24</span>}
                            {showCardLocation && <span>📍 Tech Pavilion</span>}
                          </div>
                        </div>
                        <div className="w-20 flex-shrink-0 space-y-1">
                          {showCardCapacity && (
                            <div className={`w-full h-1 rounded-full overflow-hidden border ${
                              isLight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/5"
                            }`}>
                              <div className="h-full rounded-full transition-all" style={{ width: '42%', backgroundColor: adjustedAccentColor }} />
                            </div>
                          )}
                          <div className="w-full text-white text-[7px] font-black py-1 rounded-md text-center cursor-not-allowed transition-colors" style={{ backgroundColor: adjustedAccentColor }}>
                            Register
                          </div>
                        </div>
                      </div>
                    ) : hubLayout === "CAROUSEL" ? (
                      <div className="relative max-w-xs mx-auto overflow-hidden z-10">
                        <div className="flex gap-3 overflow-x-auto py-1 scrollbar-none">
                          <div 
                            style={{ flex: "0 0 160px", backgroundColor: mockCardBg, borderColor: mockCardBorder }}
                            className="border rounded-xl p-3 text-left shadow-md space-y-2.5 relative overflow-hidden"
                          >
                            <div className={`rounded-lg border flex items-center justify-center relative overflow-hidden flex-shrink-0 ${
                              autoFitImages ? 'h-16' : 'h-12'
                            } ${
                              isLight
                                ? "bg-gradient-to-br from-slate-100 to-slate-200/50 border-slate-200/60"
                                : "bg-gradient-to-br from-accent-primary/10 to-slate-900/60 border-white/5"
                            }`}>
                              <span className={`text-center font-black uppercase text-[7px] z-10 ${
                                isLight ? "text-slate-655" : "text-slate-350"
                              }`}>
                                Sample Summit 2026
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <h6 className="text-[9px] font-black truncate">Sample Summit 2026</h6>
                              <p className="text-[7px] leading-snug line-clamp-1 opacity-75">
                                An exclusive workshop event covering next-gen APIs.
                              </p>
                            </div>
                            {(showCardDate || showCardLocation) && (
                              <div className="text-[6px] space-y-0.5 font-bold opacity-65">
                                {showCardDate && <div>📅 Saturday, Jan 24, 2026</div>}
                                {showCardLocation && <div>📍 Tech Pavilion, Hall B</div>}
                              </div>
                            )}
                            <div className={`space-y-1.5 pt-1.5 border-t ${
                              isLight ? "border-slate-100" : "border-white/5"
                            }`}>
                              {showCardCapacity && (
                                <div className={`w-full h-1 rounded-full overflow-hidden border ${
                                  isLight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/5"
                                }`}>
                                  <div className="h-full rounded-full transition-all" style={{ width: '42%', backgroundColor: adjustedAccentColor }} />
                                </div>
                              )}
                              <div className="w-full text-white text-[7px] font-black py-1 rounded-md text-center cursor-not-allowed transition-colors" style={{ backgroundColor: adjustedAccentColor }}>
                                Register
                              </div>
                            </div>
                          </div>
                          <div 
                            style={{ 
                              flex: "0 0 160px", 
                              backgroundColor: isLight ? "rgba(255, 255, 255, 0.45)" : "rgba(255, 255, 255, 0.02)", 
                              borderColor: isLight ? "rgba(15, 23, 42, 0.04)" : "rgba(255, 255, 255, 0.04)" 
                            }} 
                            className="border rounded-xl p-3 text-left shadow-md space-y-2.5 opacity-60 pointer-events-none"
                          >
                            <div className={`h-12 rounded-lg border flex items-center justify-center ${
                              isLight
                                ? "bg-slate-100 border-slate-200/65"
                                : "bg-gradient-to-br from-accent-primary/10 to-slate-900/60 border-white/5"
                            }`} />
                            <h6 className="text-[9px] font-bold opacity-80">Next Tech Meetup</h6>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        style={{ backgroundColor: mockCardBg, borderColor: mockCardBorder }}
                        className="border rounded-xl p-4 text-left relative overflow-hidden space-y-3 shadow-md max-w-xs mx-auto relative z-10"
                      >
                        <div className={`rounded-lg border flex items-center justify-center relative overflow-hidden flex-shrink-0 ${
                          autoFitImages ? 'h-24' : 'h-16'
                        } ${
                          isLight
                            ? "bg-gradient-to-br from-slate-100 to-slate-200/50 border-slate-200/60"
                            : "bg-gradient-to-br from-accent-primary/10 to-slate-900/60 border-white/5"
                        }`}>
                          <span className={`text-center font-black uppercase text-[8px] z-10 ${
                            isLight ? "text-slate-655" : "text-slate-350"
                          }`}>
                            Sample Summit 2026
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <h6 className="text-[10px] font-black">Sample Summit 2026</h6>
                          <p className="text-[8px] leading-snug line-clamp-1 opacity-75">
                            An exclusive workshop event covering the next-generation API frameworks.
                          </p>
                        </div>

                        {(showCardDate || showCardLocation) && (
                          <div className="text-[7px] space-y-0.5 font-bold opacity-65">
                            {showCardDate && <div>📅 Saturday, Jan 24, 2026</div>}
                            {showCardLocation && <div>📍 Tech Pavilion, Hall B</div>}
                          </div>
                        )}

                        <div className={`space-y-2 pt-2 border-t ${
                          isLight ? "border-slate-100" : "border-white/5"
                        }`}>
                          {showCardCapacity && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[7px] font-bold opacity-65">
                                <span>Capacity</span>
                                <span>42 / 100 Seats</span>
                              </div>
                              <div className={`w-full h-1 rounded-full overflow-hidden border ${
                                isLight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/5"
                              }`}>
                                <div className="h-full rounded-full transition-all" style={{ width: '42%', backgroundColor: adjustedAccentColor }} />
                              </div>
                            </div>
                          )}
                          <div className="w-full text-white text-[8px] font-black py-1.5 rounded-lg text-center cursor-not-allowed transition-colors" style={{ backgroundColor: adjustedAccentColor }}>
                            Register Seat
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-text-secondary text-center mt-4">
                  Changes will be reflected instantly on your public hub.
                </div>
              </div>
            </div>
          );
        })()}
      </form>
    </div>
  );
}
