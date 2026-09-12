"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useHubCustomization, HubCustomizationData } from "@/hooks/useHubCustomization";
import { useThemes } from "@/hooks/useThemes";
import { useEvents } from "@/hooks/useEvents";
import { deriveThemeVariables } from "@/lib/color-utils";
import { formatFriendlyDate } from "@/lib/date-utils";
import dynamic from "next/dynamic";

const AuroraBg = dynamic(() => import("@/components/ui/backgrounds/Aurora"), { ssr: false });
const GradientBg = dynamic(() => import("@/components/ui/backgrounds/Gradient"), { ssr: false });
const ShapegridBg = dynamic(() => import("@/components/ui/backgrounds/Shapegrid"), { ssr: false });
const PixelsnowBg = dynamic(() => import("@/components/ui/backgrounds/Pixelsnow"), { ssr: false });
const LightfallBg = dynamic(() => import("@/components/ui/backgrounds/Lightfall"), { ssr: false });
const SideraysBg = dynamic(() => import("@/components/ui/backgrounds/Siderays"), { ssr: false });
const LightraysBg = dynamic(() => import("@/components/ui/backgrounds/Lightrays"), { ssr: false });

const presets = [
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    icon: "🔮",
    description: "Frosted Glass skin + Indigo accent + Aurora background",
    baseMode: "auto",
    accentHue: 250,
    accentChroma: 0.18,
    surfaceTone: "soft",
    skinId: "frosted",
    fontPairingId: "inter-inter",
    themeStyle: "AURORA",
  },
  {
    id: "cyber-grid",
    name: "Cyber Grid",
    icon: "⚡",
    description: "Retro Cyber skin + Pink accent + Shape Grid background",
    baseMode: "dark",
    accentHue: 330,
    accentChroma: 0.28,
    surfaceTone: "tinted",
    skinId: "retro",
    fontPairingId: "fira-inter",
    themeStyle: "SHAPEGRID",
  },
  {
    id: "cozy-soft",
    name: "Cozy Soft",
    icon: "🌿",
    description: "Minimalist Soft skin + Emerald accent + Gradient background",
    baseMode: "light",
    accentHue: 220,
    accentChroma: 0.12,
    surfaceTone: "soft",
    skinId: "soft",
    fontPairingId: "inter-inter",
    themeStyle: "GRADIENT",
  },
  {
    id: "retro-arcade",
    name: "Retro Arcade",
    icon: "🕹️",
    description: "Retro Cyber skin + Yellow accent + Pixel Snow background",
    baseMode: "dark",
    accentHue: 40,
    accentChroma: 0.22,
    surfaceTone: "mid",
    skinId: "retro",
    fontPairingId: "inter-mono",
    themeStyle: "PIXELSNOW",
  },
];

export default function CustomizationTab() {
  const { user, adminTheme } = useAuth();
  const { themes, skins } = useThemes();
  const { events } = useEvents();
  const {
    customization,
    isLoading: loadingCustomization,
    saveCustomization,
    isSaving: savingCustomization,
    uploadImage,
  } = useHubCustomization();

  // Settings tab selection state
  const [activeTab, setActiveTab] = useState<"branding" | "layout" | "style">("branding");
  const [logoSource, setLogoSource] = useState<"upload" | "url">("upload");

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
  const [hubSkinId, setHubSkinId] = useState("");
  const [baseMode, setBaseMode] = useState<string>("dark");
  const [accentHue, setAccentHue] = useState<number>(250);
  const [accentChroma, setAccentChroma] = useState<number>(0.18);
  const [surfaceTone, setSurfaceTone] = useState<string>("mid");
  const [skinId, setSkinId] = useState<string>("frosted");
  const [fontPairingId, setFontPairingId] = useState<string>("inter-inter");
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
      setHubSkinId(customization.hubSkinId || "");
      setBaseMode(customization.baseMode || "dark");
      setAccentHue(customization.accentHue ?? 250);
      setAccentChroma(customization.accentChroma ?? 0.18);
      setSurfaceTone(customization.surfaceTone || "mid");
      setSkinId(customization.skinId || "frosted");
      setFontPairingId(customization.fontPairingId || "inter-inter");
      setHubBannerUrl(customization.hubBannerUrl || "");
      setHubThemeStyle(customization.hubThemeStyle || "DOT_MATRIX");
      setAutoFitImages(customization.autoFitImages !== false);
      
      if (customization.hubLogoUrl) {
        setLogoSource("url");
      }
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
      hubSkinId: hubSkinId || null,
      baseMode,
      accentHue,
      accentChroma,
      surfaceTone,
      skinId,
      fontPairingId,
      hubBannerUrl: hubBannerUrl || null,
      hubThemeStyle,
      autoFitImages,
    });
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;
    setBaseMode(preset.baseMode);
    setAccentHue(preset.accentHue);
    setAccentChroma(preset.accentChroma);
    setSurfaceTone(preset.surfaceTone);
    setSkinId(preset.skinId);
    setFontPairingId(preset.fontPairingId);
    setHubThemeStyle(preset.themeStyle);
    const skin = skins.find(s => s.slug === preset.skinId);
    if (skin) setHubSkinId(skin.id);
  };

  const getActivePreset = () => {
    return presets.find(p => 
      baseMode === p.baseMode &&
      accentHue === p.accentHue &&
      accentChroma === p.accentChroma &&
      surfaceTone === p.surfaceTone &&
      skinId === p.skinId &&
      fontPairingId === p.fontPairingId &&
      hubThemeStyle === p.themeStyle
    )?.id || null;
  };

  const activePreset = getActivePreset();

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
        {/* Left Column: Form inputs with premium tabs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-border-main/50 pb-px gap-1">
            {[
              { id: "branding", label: "Branding", icon: "🎨" },
              { id: "layout", label: "Layout & Cards", icon: "📐" },
              { id: "style", label: "Style & Theme", icon: "✨" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-black transition-all -mb-px cursor-pointer ${
                  activeTab === tab.id
                    ? "border-accent-primary text-accent-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-main/30"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content: Branding & Info */}
          {activeTab === "branding" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider mb-1">
                  Brand & Header Information
                </h4>
                <p className="text-xs text-text-secondary">
                  Configure the header text, logo representation, and public welcome message.
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

                    <div className="flex gap-1.5 p-1 rounded-xl bg-bg-panel/40 border border-border-main max-w-xs">
                      <button
                        type="button"
                        onClick={() => setLogoSource("upload")}
                        className={`flex-1 py-1 text-center text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                          logoSource === "upload"
                            ? "bg-bg-panel border border-border-main text-text-primary shadow-sm"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        Upload Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoSource("url")}
                        className={`flex-1 py-1 text-center text-[9px] font-bold rounded-lg transition-all cursor-pointer ${
                          logoSource === "url"
                            ? "bg-bg-panel border border-border-main text-text-primary shadow-sm"
                            : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        Custom URL
                      </button>
                    </div>

                    {logoSource === "upload" ? (
                      <div key="upload-container" className="relative flex items-center justify-center border border-dashed border-border-main hover:border-text-secondary rounded-xl p-4 bg-bg-panel/20 transition group">
                        <input
                          key="logo-file-input"
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
                    ) : (
                      <div key="url-container">
                        <input
                          key="logo-url-input"
                          type="url"
                          value={hubLogoUrl}
                          onChange={(e) => setHubLogoUrl(e.target.value || "")}
                          placeholder="https://example.com/logo.png"
                          className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-primary transition"
                        />
                      </div>
                    )}
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

                {/* Cover Banner Image */}
                <div className="space-y-2 pt-2">
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
            </div>
          )}

          {/* Tab Content: Layout & Card elements */}
          {activeTab === "layout" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider mb-1">
                  Layout & Card Appearance
                </h4>
                <p className="text-xs text-text-secondary">
                  Configure structural layout templates and choose which details are exposed on each listing card.
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                      Hub Layout Style
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
                      Hub Fallback Theme Preset
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-bg-panel/20 border border-border-main hover:bg-bg-panel/40 transition cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-text-primary block">Show Event Date</span>
                      <span className="text-[10px] text-text-secondary">Render calendar details.</span>
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
                      <span className="text-[10px] text-text-secondary">Render map pin description.</span>
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
                      <span className="text-[10px] text-text-secondary">Show seating limit indicators.</span>
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
                      <span className="text-[10px] text-text-secondary">Keep images uncropped.</span>
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
            </div>
          )}

          {/* Tab Content: Styling & Custom colors */}
          {activeTab === "style" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider mb-1">
                  Styling & Brand Themes
                </h4>
                <p className="text-xs text-text-secondary">
                  Choose visual skin layouts, pick color presets, or override specific accent colors and grids.
                </p>
              </div>

              {/* Visual Vibe Presets */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Visual Vibe Presets (1-Click Styles)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {presets.map((preset) => {
                    const isActive = activePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset.id)}
                        className={`relative overflow-hidden text-left bg-slate-950/60 border rounded-xl p-3.5 flex flex-col justify-between transition-all duration-300 hover:border-slate-700 hover:bg-slate-950/90 group cursor-pointer min-h-[85px] ${
                          isActive
                            ? "border-accent-primary ring-2 ring-accent-primary/25 shadow-lg"
                            : "border-slate-800/80"
                        }`}
                      >
                        <div
                          className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-500 pointer-events-none"
                          style={{ backgroundColor: `oklch(0.65, ${preset.accentChroma}, ${preset.accentHue})` }}
                        />
                        
                        <div className="flex justify-between items-start w-full gap-2 relative z-10">
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-200 block flex items-center gap-1.5">
                              <span className="text-sm">{preset.icon}</span>
                              {preset.name}
                            </span>
                            <span className="text-[9px] text-slate-400 block leading-tight">
                              {preset.description}
                            </span>
                          </div>
                          <div
                            className="w-4.5 h-4.5 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: `oklch(0.65, ${preset.accentChroma}, ${preset.accentHue})` }}
                          />
                        </div>
                        
                        {isActive && (
                          <div className="absolute bottom-1 right-2 text-[8px] font-black uppercase text-accent-primary tracking-widest">
                            Active
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advanced Controls Rendered Directly (No Collapsible Hideaway) */}
              <div className="p-5 rounded-xl border border-border-main/55 bg-bg-panel/10 space-y-6">
                {/* Base Mode Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Color Mode
                  </label>
                  <div className="flex gap-1.5 p-1 rounded-xl bg-bg-panel/40 border border-border-main">
                    {[
                      { id: "dark", label: "🌙 Dark" },
                      { id: "light", label: "☀️ Light" },
                      { id: "auto", label: "⚡ Auto (System)" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setBaseMode(m.id)}
                        className={`flex-1 py-2 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          baseMode === m.id
                            ? "bg-bg-panel border border-border-main text-text-primary shadow-sm"
                            : "text-text-secondary hover:text-text-primary border border-transparent"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hue Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                      Accent Hue
                    </label>
                    <span className="text-[10px] font-mono font-bold text-accent-primary">{accentHue}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={accentHue}
                    onChange={(e) => setAccentHue(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-red-500"
                  />
                </div>

                {/* Chroma Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                      Accent Chroma (Color Intensity)
                    </label>
                    <span className="text-[10px] font-mono font-bold text-accent-primary">{Math.round(accentChroma * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={accentChroma * 100}
                    onChange={(e) => setAccentChroma(parseFloat(e.target.value) / 100)}
                    className="w-full h-1.5 rounded-lg appearance-none bg-slate-800 accent-accent-primary cursor-pointer"
                  />
                </div>

                {/* Surface Tone Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Surface Tone
                  </label>
                  <div className="flex gap-1.5 p-1 rounded-xl bg-bg-panel/40 border border-border-main">
                    {[
                      { id: "deep", label: "Deep Dark" },
                      { id: "mid", label: "Medium Mid" },
                      { id: "soft", label: "Soft Tint" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSurfaceTone(t.id)}
                        className={`flex-1 py-2 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          surfaceTone === t.id
                            ? "bg-bg-panel border border-border-main text-text-primary shadow-sm"
                            : "text-text-secondary hover:text-text-primary border border-transparent"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography pairing */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Typography pairing
                  </label>
                  <select
                    value={fontPairingId}
                    onChange={(e) => setFontPairingId(e.target.value)}
                    className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition cursor-pointer"
                  >
                    <option value="inter-inter" className="bg-bg-panel text-text-primary">Clean Sans (Inter + Inter)</option>
                    <option value="outfit-inter" className="bg-bg-panel text-text-primary">Modern Display (Outfit + Inter)</option>
                    <option value="space-inter" className="bg-bg-panel text-text-primary">Playful Geometric (Space Grotesk + Inter)</option>
                    <option value="fira-inter" className="bg-bg-panel text-text-primary">Brutalist Monospace (Fira Code + Inter)</option>
                    <option value="inter-mono" className="bg-bg-panel text-text-primary">Code Layout (Inter + Fira Code)</option>
                  </select>
                </div>

                {/* Skin Selector */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Visual Vibe / Skin
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'frosted', name: '🔮 Frosted Glass', desc: 'Glass blur, smooth corners' },
                      { id: 'sharp', name: '📐 Sharp Brutalist', desc: 'Sharp angles, thick outlines' },
                      { id: 'soft', name: '🌿 Minimalist Soft', desc: 'Pill roundness, soft outlines' },
                      { id: 'retro', name: '👾 Retro Cyber', desc: 'Neon glows, monospace styling' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSkinId(s.id);
                          const skin = skins.find(sk => sk.slug === s.id);
                          if (skin) setHubSkinId(skin.id);
                        }}
                        className={`bg-slate-950 border rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-slate-700 ${
                          skinId === s.id 
                            ? "border-accent-primary ring-2 ring-accent-primary/20 shadow-sm" 
                            : "border-slate-800/80"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-200 block truncate w-full">{s.name}</span>
                        <span className="text-[8px] text-slate-500 block truncate w-full mt-1 leading-tight">
                          {s.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specific Backdrop Style Override */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Custom Background / Backdrop Style
                  </label>
                  <select
                    value={hubThemeStyle}
                    onChange={(e) => setHubThemeStyle(e.target.value)}
                    className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition cursor-pointer"
                  >
                    <optgroup label="Standard Grid Backgrounds" className="bg-bg-panel text-text-primary font-bold">
                      <option value="DOT_MATRIX" className="bg-bg-panel text-text-primary">Standard Dot Grid</option>
                      <option value="GRID_WARP" className="bg-bg-panel text-text-primary">Spotlight Grid Warp</option>
                      <option value="AURORA_GLOW" className="bg-bg-panel text-text-primary">Aurora Glow Orbs</option>
                    </optgroup>
                    <optgroup label="Lightweight Animated Backgrounds" className="bg-bg-panel text-text-primary font-bold">
                      <option value="AURORA" className="bg-bg-panel text-text-primary font-bold">Neon Blobs (Aurora)</option>
                      <option value="GRADIENT" className="bg-bg-panel text-text-primary">Moving Mesh (Gradient)</option>
                      <option value="SHAPEGRID" className="bg-bg-panel text-text-primary">Cyber Shape Grid</option>
                      <option value="PIXELSNOW" className="bg-bg-panel text-text-primary">Pixel Snow Drift</option>
                      <option value="LIGHTFALL" className="bg-bg-panel text-text-primary">Lightfall Particles</option>
                      <option value="SIDERAYS" className="bg-bg-panel text-text-primary">Skewed Siderays</option>
                      <option value="LIGHTRAYS" className="bg-bg-panel text-text-primary">Sunbeam Lightrays</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-main/50">
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
          const paletteIntent = {
            baseMode,
            accentHue,
            accentChroma,
            surfaceTone,
            skinId,
            fontPairingId,
          };

          const activePreviewMode = baseMode === "auto" 
            ? previewThemeMode 
            : (baseMode === "light" ? "light" : "dark");

          const derived = deriveThemeVariables(paletteIntent, activePreviewMode);

          const backdropStyle = hubThemeStyle || "DOT_MATRIX";
          const borderRadius = derived.radiusCard;
          const borderStyle = "solid";
          const borderWidth = derived.cardBorder === 'none' ? '0px' : '1px';
          const shadowStyle = "custom";
          const fontFamily = derived.fontBody;

          const isLight = activePreviewMode === "light";
          const contrastBg = derived.bgColor;
          const adjustedAccentColor = derived.primaryColor;
          const mockCardBg = derived.cardBg;
          const mockCardBorder = derived.cardBorder;
          const gridLineColor = derived.gridLineColor;
          const gridOpacity = derived.gridOpacity;

          let mockupBgStyle: React.CSSProperties = {
            backgroundColor: contrastBg,
          };

          // Load dynamic first event data if available for realistic previewing
          const activeEvent = events && events.length > 0 ? events[0] : null;
          const previewTitle = activeEvent?.title || "Sample Summit 2026";
          const previewDesc = activeEvent?.description || "An exclusive workshop event covering next-gen APIs.";
          const previewDateStr = activeEvent?.date ? formatFriendlyDate(activeEvent.date) : "Saturday, Jan 24, 2026";
          const previewLocation = activeEvent?.location || "Tech Pavilion, Hall B";
          const previewPosterUrl = activeEvent?.posterUrl || "";
          const previewMax = activeEvent?.maxRegistrations || 100;
          const previewRegCount = activeEvent?._count?.registrations || 42;
          const previewCapacityPercent = activeEvent?.maxRegistrations
            ? Math.min((previewRegCount / activeEvent.maxRegistrations) * 100, 100)
            : 42;

          return (
            <div className="lg:col-span-5 lg:sticky lg:top-6 lg:h-fit space-y-6">
              <div className="bg-bg-panel/40 border border-border-main/50 rounded-2xl p-6 shadow-md flex flex-col justify-between min-h-[450px]">
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
                    style={{
                      ...mockupBgStyle,
                      color: derived.textColor,
                      fontFamily,
                      "--hub-accent-color": adjustedAccentColor,
                      "--hub-bg-color": contrastBg,
                      "--hub-card-bg": mockCardBg,
                      "--hub-card-border": mockCardBorder,
                      "--hub-grid-line-color": gridLineColor,
                      "--hub-grid-opacity": gridOpacity,
                      "--hub-spotlight-opacity": activePreviewMode === "light" ? "0.08" : "0.14",
                      "--hub-aurora-accent-opacity": activePreviewMode === "light" ? "0.04" : "0.06",
                      "--hub-aurora-pink-opacity": activePreviewMode === "light" ? "0.03" : "0.05",
                    } as React.CSSProperties}
                  >
                    {/* Dynamic backdrop selector */}
                    {(() => {
                      switch (backdropStyle) {
                        case "GRID_WARP":
                          return (
                            <>
                              <div
                                style={{
                                  backgroundColor: adjustedAccentColor,
                                  animation: 'spotlight-pulse 16s infinite ease-in-out',
                                }}
                                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] pointer-events-none transition-all duration-500 opacity-[var(--hub-spotlight-opacity,0.12)]"
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
                        case "AURORA_GLOW":
                          return (
                            <>
                              <div
                                className={`absolute top-0 -left-6 w-24 h-24 rounded-full blur-xl pointer-events-none transition-all duration-500 ${isLight ? 'opacity-5' : 'opacity-20'}`}
                                style={{ backgroundColor: adjustedAccentColor }}
                              />
                              <div
                                className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-xl pointer-events-none transition-all duration-500 ${isLight ? 'opacity-4' : 'opacity-15'}`}
                                style={{ backgroundColor: '#ec4899' }}
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
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                backgroundImage: `radial-gradient(rgba(${gridLineColor}, ${gridOpacity}) 1px, transparent 1px)`,
                                backgroundSize: '6px 6px',
                                transition: 'background-image 0.3s ease',
                              }}
                            />
                          );
                      }
                    })()}

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
                        style={{ 
                          backgroundColor: mockCardBg, 
                          border: `${borderWidth} ${borderStyle} ${mockCardBorder}`,
                          borderRadius,
                          boxShadow: derived.shadowCard,
                        }}
                        className="p-3 text-left flex items-center gap-3 max-w-sm mx-auto relative z-10"
                      >
                        <div className={`w-16 rounded-lg border flex items-center justify-center flex-shrink-0 relative overflow-hidden ${
                          autoFitImages ? 'h-auto' : 'h-12'
                        } ${
                          isLight
                            ? "bg-gradient-to-br from-slate-100 to-slate-200/50 border-slate-200/60"
                            : "bg-gradient-to-br from-accent-primary/10 to-slate-900/60 border-white/5"
                        }`}>
                          {previewPosterUrl ? (
                            <img
                              src={previewPosterUrl}
                              alt={previewTitle}
                              className={autoFitImages ? "relative w-full h-auto object-contain" : "absolute inset-0 w-full h-full object-cover"}
                            />
                          ) : (
                            <span className={`text-center font-black uppercase text-[7px] z-10 ${
                              isLight ? "text-slate-655" : "text-slate-350"
                            }`}>
                              {previewTitle.substring(0, 3)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h6 className="text-[10px] font-black truncate">{previewTitle}</h6>
                          <p className="text-[8px] leading-snug truncate opacity-75">
                            {previewDesc}
                          </p>
                          <div className="flex gap-2 text-[7px] font-bold opacity-65">
                            {showCardDate && <span>📅 {previewDateStr.split(" • ")[0]}</span>}
                            {showCardLocation && <span className="truncate">📍 {previewLocation.split(",")[0]}</span>}
                          </div>
                        </div>
                        <div className="w-20 flex-shrink-0 space-y-1">
                          {showCardCapacity && (
                            <div className={`w-full h-1 rounded-full overflow-hidden border ${
                              isLight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/5"
                            }`}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${previewCapacityPercent}%`, backgroundColor: adjustedAccentColor }} />
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
                            style={{ 
                              flex: "0 0 160px", 
                              backgroundColor: mockCardBg, 
                              border: `${borderWidth} ${borderStyle} ${mockCardBorder}`,
                              borderRadius,
                              boxShadow: derived.shadowCard,
                            }}
                            className="p-3 text-left space-y-2.5 relative overflow-hidden"
                          >
                            <div className={`rounded-lg border flex items-center justify-center relative overflow-hidden flex-shrink-0 ${
                              autoFitImages ? 'h-auto' : 'h-12'
                            } ${
                              isLight
                                ? "bg-gradient-to-br from-slate-100 to-slate-200/50 border-slate-200/60"
                                : "bg-gradient-to-br from-accent-primary/10 to-slate-900/60 border-white/5"
                            }`}>
                              {previewPosterUrl ? (
                                <img
                                  src={previewPosterUrl}
                                  alt={previewTitle}
                                  className={autoFitImages ? "relative w-full h-auto object-contain" : "absolute inset-0 w-full h-full object-cover"}
                                />
                              ) : (
                                <span className={`text-center font-black uppercase text-[7px] z-10 ${
                                  isLight ? "text-slate-655" : "text-slate-350"
                                }`}>
                                  {previewTitle.substring(0, 3)}
                                </span>
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <h6 className="text-[9px] font-black truncate">{previewTitle}</h6>
                              <p className="text-[7px] leading-snug line-clamp-1 opacity-75">
                                {previewDesc}
                              </p>
                            </div>
                            {(showCardDate || showCardLocation) && (
                              <div className="text-[6px] space-y-0.5 font-bold opacity-65">
                                {showCardDate && <div>📅 {previewDateStr.split(" • ")[0]}</div>}
                                {showCardLocation && <div>📍 {previewLocation.split(",")[0]}</div>}
                              </div>
                            )}
                            <div className={`space-y-1.5 pt-1.5 border-t ${
                              isLight ? "border-slate-100" : "border-white/5"
                            }`}>
                              {showCardCapacity && (
                                <div className={`w-full h-1 rounded-full overflow-hidden border ${
                                  isLight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/5"
                                }`}>
                                  <div className="h-full rounded-full transition-all" style={{ width: `${previewCapacityPercent}%`, backgroundColor: adjustedAccentColor }} />
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
                        style={{ 
                          backgroundColor: mockCardBg, 
                          border: `${borderWidth} ${borderStyle} ${mockCardBorder}`,
                          borderRadius,
                          boxShadow: derived.shadowCard,
                        }}
                        className="p-4 text-left relative overflow-hidden space-y-3 shadow-md max-w-xs mx-auto relative z-10"
                      >
                        <div className={`rounded-lg border flex items-center justify-center relative overflow-hidden flex-shrink-0 ${
                          autoFitImages ? 'h-auto' : 'h-16'
                        } ${
                          isLight
                            ? "bg-gradient-to-br from-slate-100 to-slate-200/50 border-slate-200/60"
                            : "bg-gradient-to-br from-accent-primary/10 to-slate-900/60 border-white/5"
                        }`}>
                          {previewPosterUrl ? (
                            <img
                              src={previewPosterUrl}
                              alt={previewTitle}
                              className={autoFitImages ? "relative w-full h-auto object-contain" : "absolute inset-0 w-full h-full object-cover"}
                            />
                          ) : (
                            <span className={`text-center font-black uppercase text-[8px] z-10 ${
                              isLight ? "text-slate-655" : "text-slate-350"
                            }`}>
                              {previewTitle.substring(0, 3)}
                            </span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <h6 className="text-[10px] font-black">{previewTitle}</h6>
                          <p className="text-[8px] leading-snug line-clamp-1 opacity-75">
                            {previewDesc}
                          </p>
                        </div>

                        {(showCardDate || showCardLocation) && (
                          <div className="text-[7px] space-y-0.5 font-bold opacity-65">
                            {showCardDate && <div>📅 {previewDateStr.split(" • ")[0]}</div>}
                            {showCardLocation && <div>📍 {previewLocation}</div>}
                          </div>
                        )}

                        <div className={`space-y-2 pt-2 border-t ${
                          isLight ? "border-slate-100" : "border-white/5"
                        }`}>
                          {showCardCapacity && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[7px] font-bold opacity-65">
                                <span>Capacity</span>
                                <span>{previewRegCount} / {previewMax} Seats</span>
                              </div>
                              <div className={`w-full h-1 rounded-full overflow-hidden border ${
                                isLight ? "bg-slate-100 border-slate-200" : "bg-black/40 border-white/5"
                              }`}>
                                <div className="h-full rounded-full transition-all" style={{ width: `${previewCapacityPercent}%`, backgroundColor: adjustedAccentColor }} />
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
