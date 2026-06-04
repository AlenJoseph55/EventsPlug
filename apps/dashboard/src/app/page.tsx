"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  // Mock Interactive Sandbox States
  const [mockRegistrations, setMockRegistrations] = useState(148);
  const [mockName, setMockName] = useState("");
  const [mockEmail, setMockEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [sandboxTemplate, setSandboxTemplate] = useState<"GAMING" | "HACKATHON">("GAMING");

  // Code Tab Selection
  const [activeCodeTab, setActiveCodeTab] = useState<"html" | "react" | "vue">("html");
  const [copied, setCopied] = useState(false);

  // Scroll animations triggers (fade-in on mount)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMockRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockName || !mockEmail) return;
    setIsRegistering(true);
    setTimeout(() => {
      setIsRegistering(false);
      setIsRegistered(true);
      setMockRegistrations((prev) => prev + 1);
    }, 1200);
  };

  const resetMockSandbox = () => {
    setIsRegistered(false);
    setMockName("");
    setMockEmail("");
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets = {
    html: `<!-- 1. Include the EventsPlug dynamic loader script -->
<script type="module" src="https://eventsplug.com/widget.js"></script>

<!-- 2. Mount the native widget wherever you want it to appear -->
<event-widget org="hash2025"></event-widget>`,
    react: `// 1. Install workspace wrapper
// npm install @eventflow/react

import { EventsWidget } from '@eventflow/react';

export default function EventsSection() {
  return (
    <div className="w-full max-w-4xl py-12">
      <EventsWidget 
        org="hash2025"
        scriptUrl="https://eventsplug.com/widget.js"
      />
    </div>
  );
}`,
    vue: `<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // Dynamic Web component loader
  if (!document.getElementById('eventsplug-script')) {
    const script = document.createElement('script');
    script.id = 'eventsplug-script';
    script.type = 'module';
    script.src = 'https://eventsplug.com/widget.js';
    document.head.appendChild(script);
  }
});
</script>

<template>
  <div class="widget-wrapper">
    <event-widget org="hash2025"></event-widget>
  </div>
</template>`
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}>
      
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] right-[20%] w-[40%] h-[40%] bg-blue-900/5 rounded-full blur-[100px]" />
      </div>

      {/* Header Sticky Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-900/80 bg-slate-950/70 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-slate-100 via-slate-100 to-indigo-400 bg-clip-text text-transparent font-mono">
              EVENTSPLUG
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-slate-200 transition">Features</a>
            <a href="#sandbox" className="hover:text-slate-200 transition">Interactive Sandbox</a>
            <a href="#developer" className="hover:text-slate-200 transition">Developer Code</a>
            <a href="#pricing" className="hover:text-slate-200 transition">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/portal"
              className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xs font-bold text-slate-200 rounded-xl group bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 group-hover:from-indigo-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-800 transition-all duration-200 mt-2"
            >
              <span className="relative px-5 py-2 transition-all ease-in duration-75 bg-slate-950 rounded-xl group-hover:bg-opacity-0">
                Launch Console →
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Main hero panel section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-28 space-y-32">
        
        {/* HERO HEADER */}
        <section className="text-center max-w-4xl mx-auto space-y-8 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/20 text-indigo-400 text-xs font-bold font-mono tracking-wide shadow-md shadow-indigo-950/50">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            Version 2.0 Dynamic Embeds Released
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Pre-built event registration,{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              embedded in seconds.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop building forms manually. Drop interactive widgets onto your host website, or launch premium standalone event landing pages instantly. **No website or coding required.**
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="/portal"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all duration-200 text-center"
            >
              Get Started Free
            </a>
            <a
              href="#sandbox"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 text-slate-300 hover:text-white font-bold text-sm transition-all text-center"
            >
              Try Live Demo
            </a>
          </div>

          {/* Social logos proofing */}
          <div className="pt-12 space-y-4">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
              POWERING REGISTRATIONS FOR INNOVATIVE TEAMS
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 grayscale contrast-200">
              <span className="text-sm font-black tracking-widest font-mono text-slate-300">HASH.EDU</span>
              <span className="text-sm font-black tracking-widest font-mono text-slate-300">DEVCON_SEATTLE</span>
              <span className="text-sm font-black tracking-widest font-mono text-slate-300">ESPORTS_NATION</span>
              <span className="text-sm font-black tracking-widest font-mono text-slate-300">INDIE_BOOST</span>
            </div>
          </div>
        </section>

        {/* INTERACTIVE PLAYGROUND SANDBOX */}
        <section id="sandbox" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-100">
              The Interactive Playground
            </h2>
            <p className="text-sm text-slate-400">
              Customize the form template on the left and test the secure embed live on the right
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Control Panel */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-slate-900 rounded-3xl p-8 flex flex-col justify-between space-y-8 shadow-xl">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block mb-2 font-mono">
                    Step 1: Select Layout Template
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setSandboxTemplate("GAMING"); resetMockSandbox(); }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        sandboxTemplate === "GAMING"
                          ? "border-indigo-500 bg-indigo-950/20 text-white"
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="block text-xs font-extrabold uppercase mb-1">Tactical Cup</span>
                      <span className="text-[10px] opacity-75">Gaming 5v5 Tournament</span>
                    </button>
                    <button
                      onClick={() => { setSandboxTemplate("HACKATHON"); resetMockSandbox(); }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        sandboxTemplate === "HACKATHON"
                          ? "border-indigo-500 bg-indigo-950/20 text-white"
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="block text-xs font-extrabold uppercase mb-1">Global hack</span>
                      <span className="text-[10px] opacity-75">36hr Innovation Sprint</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">
                    Platform Statistics
                  </span>
                  <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        LIVE & SECURE
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Dynamic Registrations:</span>
                      <span className="text-slate-200 font-bold font-mono">{mockRegistrations} / 150 slots</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl text-[11px] text-slate-400 leading-relaxed">
                🚀 **Under the hood**: This mock represents our native custom {"<event-widget>"} running inside an isolated sandbox boundary, dynamically resolving validation schemas.
              </div>
            </div>

            {/* Sandbox Embed Card View */}
            <div className="lg:col-span-7 bg-[#05070c] border border-slate-800/80 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col justify-center min-h-[420px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              {/* Dynamic Header preview */}
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-900/50 uppercase tracking-wider font-mono">
                    {sandboxTemplate} Form Widget
                  </span>
                  <h3 className="text-xl font-black text-slate-100 mt-2 font-mono">
                    {sandboxTemplate === "GAMING" ? "🏆 Valorant Tactical Arena" : "💻 Global Tech Hackathon"}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">Hosted Tenant</span>
                  <span className="text-xs text-slate-300 font-bold font-mono">hash2025</span>
                </div>
              </div>

              {isRegistered ? (
                <div className="text-center py-12 space-y-4 animate-scaleUp">
                  <div className="w-16 h-16 rounded-full bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 text-3xl">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white font-mono">Registration Success Secured!</h4>
                    <p className="text-xs text-slate-400">
                      Your mock seat is locked. Attendee records dynamically synced to organizer ledger.
                    </p>
                  </div>
                  <button
                    onClick={resetMockSandbox}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
                  >
                    🔄 Test Registration Again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMockRegister} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Attendee Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
                        value={mockName}
                        onChange={(e) => setMockName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Attendee Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@domain.com"
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
                        value={mockEmail}
                        onChange={(e) => setMockEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {sandboxTemplate === "GAMING" ? (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        In-Game Username (Riot ID)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TenZ#NA1"
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        GitHub Profile Link
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://github.com/profile"
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow shadow-indigo-600/30 flex justify-center items-center gap-2"
                  >
                    {isRegistering ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Securing Mock Ledger Seat...
                      </>
                    ) : (
                      "Lock Registration Seat 🚀"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* BENTO FEATURE SECTION */}
        <section id="features" className="space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block font-mono">
              ENGINEERED FOR MODERN DEVELOPERS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Powerful widgets, modular architecture.
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Everything you need to handle high-concurrency event registrations securely, without writing custom database migrations or validator models.
            </p>
          </div>

          {/* Bento layout grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Box 1 */}
            <div className="md:col-span-2 bg-slate-900/20 border border-slate-900 rounded-3xl p-8 flex flex-col justify-between min-h-[260px] hover:border-slate-800/80 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-900/60 flex items-center justify-center text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <div className="space-y-2 mt-8">
                <h3 className="text-lg font-bold text-slate-100">Native Web Component standard</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Engineered using browser-native Custom Elements. Zero layout shifts, zero framework bloated sizes. Built to load and paint registrations fast under heavy network loads.
                </p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-8 flex flex-col justify-between min-h-[260px] hover:border-slate-800/80 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-900/60 flex items-center justify-center text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-2 mt-8">
                <h3 className="text-lg font-bold text-slate-100">Dynamic Suspension Locks</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Super-admins can instantly lock or suspend tenants. Our inline suspension engine guarantees public endpoints drop widgets immediately when safety limits are hit.
                </p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-8 flex flex-col justify-between min-h-[260px] hover:border-slate-800/80 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-900/60 flex items-center justify-center text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="space-y-2 mt-8">
                <h3 className="text-lg font-bold text-slate-100">Dynamic Asset Uploads</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fully integrated disk image upload controller. Set customized poster banners, event schedules, and tenant logo configurations.
                </p>
              </div>
            </div>

            {/* Box 4 */}
            <div className="md:col-span-2 bg-slate-900/20 border border-slate-900 rounded-3xl p-8 flex flex-col justify-between min-h-[260px] hover:border-slate-800/80 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-900/60 flex items-center justify-center text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <div className="space-y-2 mt-8">
                <h3 className="text-lg font-bold text-slate-100">Dedicated Platform Analytics</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track dynamic metrics, conversions counts, and export custom registrants CSV files in seconds. Provides super-admins with aggregated metrics tables across all tenant boundaries.
                </p>
              </div>
            </div>

            {/* Box 5 (NEW) */}
            <div className="md:col-span-3 bg-gradient-to-tr from-indigo-950/40 via-purple-950/15 to-slate-900/30 border border-slate-900 rounded-3xl p-8 flex flex-col justify-between min-h-[280px] hover:border-slate-800/80 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500"></div>
              <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-900/60 flex items-center justify-center text-indigo-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <div className="space-y-2 mt-8 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 uppercase tracking-widest font-mono">
                  ✨ NO WEBSITE NEEDED
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-2">Direct Share Links & QR Generator</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  Generate instant, premium standalone landing pages (`/e/org/event`) complete with branded flyers, live counters, Google Calendar syncs, and high-resolution downloadable PNG QR Codes. Perfect for sharing directly on WhatsApp, Instagram, or social flyers!
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* DEVELOPER CODE WORKSPACE TABS */}
        <section id="developer" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Zero integration friction
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We provide fully pre-packaged codes and wrappers. Simply copy-paste these lines directly to boot the widgets in React, Vue, or Pure HTML.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-[#05070c] border border-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            {/* Editor Top Bar */}
            <div className="h-12 border-b border-slate-900 bg-slate-950/80 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-[10px] text-slate-500 font-mono pl-4">developer_integration_code.ts</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(codeSnippets[activeCodeTab])}
                  className="px-3 py-1 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-all"
                >
                  {copied ? "✓ Copied!" : "📋 Copy Code"}
                </button>
              </div>
            </div>

            {/* Code Selector Tabs */}
            <div className="bg-slate-950/20 border-b border-slate-900/60 flex text-xs">
              <button
                onClick={() => setActiveCodeTab("html")}
                className={`py-3 px-6 font-bold border-b-2 transition ${
                  activeCodeTab === "html"
                    ? "border-indigo-500 text-white bg-slate-900/20"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                HTML Component
              </button>
              <button
                onClick={() => setActiveCodeTab("react")}
                className={`py-3 px-6 font-bold border-b-2 transition ${
                  activeCodeTab === "react"
                    ? "border-indigo-500 text-white bg-slate-900/20"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Next.js / React Wrapper
              </button>
              <button
                onClick={() => setActiveCodeTab("vue")}
                className={`py-3 px-6 font-bold border-b-2 transition ${
                  activeCodeTab === "vue"
                    ? "border-indigo-500 text-white bg-slate-900/20"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Vue 3 Component
              </button>
            </div>

            {/* Editor Code Body */}
            <div className="p-6 bg-[#030408]/90 overflow-x-auto min-h-[220px] max-h-[360px] font-mono text-[11px] md:text-xs text-indigo-300 leading-relaxed">
              <pre className="whitespace-pre">{codeSnippets[activeCodeTab]}</pre>
            </div>
          </div>
        </section>

        {/* Code-Level Custom CSS Customization Helper (How-To Guide) */}
        <section className="space-y-8 max-w-4xl mx-auto">
          <div className="border border-indigo-500/10 bg-indigo-950/5 rounded-3xl p-8 shadow-xl space-y-4">
            <details className="group" open>
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🛠️</span>
                  <div className="space-y-0.5 text-left">
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-200">
                      Developer Layout Guide & How-To
                    </h4>
                    <p className="text-xs text-slate-400 font-semibold">
                      Learn how to override and customize Standalone Hub directories at the code level.
                    </p>
                  </div>
                </div>
                <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200 text-xs">
                  ▼
                </span>
              </summary>
              
              <div className="pt-6 mt-4 border-t border-white/5 text-left space-y-6 text-xs text-slate-400 leading-relaxed font-semibold">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-wider font-mono">
                    1. How to inject custom styles
                  </span>
                  <p>
                    As an organizer, navigate to your <strong>Dashboard &gt; Standalone Hub Customization</strong> page. Paste standard CSS declarations in the <strong>Custom CSS Editor</strong> field and click Save. The rules will immediately take effect and override default formatting on your public Standalone Event Hub directory.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-wider font-mono">
                    2. Semantic Selectors Reference
                  </span>
                  <p>
                    Target these class selectors to style specific layout divisions and card containers:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[10px]">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-white font-bold">.hub-grid</span>
                      <p className="text-[9px] text-slate-500 font-sans">Controls the multi-column parent container in GRID mode.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-white font-bold">.hub-list</span>
                      <p className="text-[9px] text-slate-500 font-sans">Controls the vertical card stack wrapper in LIST mode.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-white font-bold">.hub-carousel</span>
                      <p className="text-[9px] text-slate-500 font-sans">Controls the horizontal side-scroller wrapper in CAROUSEL mode.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-white font-bold">.hub-card</span>
                      <p className="text-[9px] text-slate-500 font-sans">Controls individual event cards across all layouts.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-white font-bold">.hub-card-cover</span>
                      <p className="text-[9px] text-slate-500 font-sans">Controls the image cover / gradient placeholder block in cards.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-white font-bold">.hub-header</span>
                      <p className="text-[9px] text-slate-500 font-sans">Controls the upper branding container (logo, title, descriptions).</p>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-white font-bold">.hub-title</span>
                      <p className="text-[9px] text-slate-500 font-sans">Controls the main welcome header text styles.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-wider font-mono">
                    3. Practical Layout CSS Snippets
                  </span>
                  <p>
                    Copy and modify these common override recipes inside your dashboard settings:
                  </p>
                  <div className="space-y-3 font-mono text-[9px]">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-300 block font-sans">A. Adjust Grid Cards Aspect Ratio & Min-Width:</span>
                      <pre className="bg-black/60 p-3 rounded-xl border border-white/5 overflow-x-auto text-indigo-300">
{`.hub-grid {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)) !important;
  gap: 32px !important;
}`}
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-300 block font-sans">B. Frosted Glass Event Cards Effect:</span>
                      <pre className="bg-black/60 p-3 rounded-xl border border-white/5 overflow-x-auto text-indigo-300">
{`.hub-card {
  background: rgba(255, 255, 255, 0.03) !important;
  backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}`}
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-300 block font-sans">C. Add Neon Pink Hover Lift-Up animation:</span>
                      <pre className="bg-black/60 p-3 rounded-xl border border-white/5 overflow-x-auto text-indigo-300">
{`.hub-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
.hub-card:hover {
  transform: translateY(-6px) scale(1.01) !important;
  border-color: #ec4899 !important;
  box-shadow: 0 10px 25px -5px rgba(236, 72, 153, 0.3) !important;
}`}
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-300 block font-sans">D. Auto-Fit Card Cover to Image Aspect Ratio:</span>
                      <pre className="bg-black/60 p-3 rounded-xl border border-white/5 overflow-x-auto text-indigo-300">
{`.hub-card-cover {
  height: auto !important;
}
.hub-card-cover img {
  position: relative !important;
  height: auto !important;
  width: 100% !important;
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </section>

        {/* PRICING PLANS SECTION */}
        <section id="pricing" className="space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider block font-mono">
              PREDICTABLE PRICING SLABS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Scale registrations effortlessly.
            </h2>
            <p className="text-sm text-slate-400">
              Start with our developer sandbox and expand subscription lines as your event traffic increases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            
            {/* Plan 1 */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-800/80 transition-all duration-300">
              <div className="space-y-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">HACKER SANDBOX</span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-xs text-slate-500">/ forever</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Perfect for local dev testings, open-source tech clubs, and sandbox prototyping.
                </p>
                <div className="border-t border-slate-900/60 pt-4 space-y-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">✓ 1 Active Organization</div>
                  <div className="flex items-center gap-2">✓ Up to 150 Registrations / event</div>
                  <div className="flex items-center gap-2">✓ Access to standard templates</div>
                </div>
              </div>
              <a
                href="/portal"
                className="mt-8 py-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-center text-xs font-bold text-slate-300 hover:text-white transition-all"
              >
                Launch Sandbox
              </a>
            </div>

            {/* Plan 2 - Featured */}
            <div className="bg-slate-900/30 border-2 border-indigo-500/80 rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-indigo-950/20 relative">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 px-3 py-1 rounded-full bg-indigo-500 text-[9px] font-black uppercase text-white tracking-wider">
                MOST POPULAR
              </div>
              <div className="space-y-4">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">GROWTH BUNDLE</span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-4xl font-extrabold">$49</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For active collegiate leagues, high-frequency technical meetups, and gaming cups.
                </p>
                <div className="border-t border-indigo-950/40 pt-4 space-y-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2">✓ Unlimited Active Organizations</div>
                  <div className="flex items-center gap-2">✓ Unlimited Registrations & attendees</div>
                  <div className="flex items-center gap-2">✓ Custom posters & branding configurations</div>
                  <div className="flex items-center gap-2">✓ Priority Email support channels</div>
                </div>
              </div>
              <a
                href="/portal"
                className="mt-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-center text-xs font-bold text-white shadow shadow-indigo-600/30 transition-all"
              >
                Subscribe to Growth
              </a>
            </div>

            {/* Plan 3 */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-800/80 transition-all duration-300">
              <div className="space-y-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">ENTERPRISE HUB</span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-4xl font-extrabold">Custom</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated high-concurrency database partitions, custom subdomains, and corporate SLA.
                </p>
                <div className="border-t border-slate-900/60 pt-4 space-y-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">✓ Custom API integrations & hooks</div>
                  <div className="flex items-center gap-2">✓ Dedicated high-concurrency partitions</div>
                  <div className="flex items-center gap-2">✓ 24/7 dedicated account manager</div>
                  <div className="flex items-center gap-2">✓ Custom subdomain (registrations.yourbrand.com)</div>
                </div>
              </div>
              <a
                href="mailto:enterprise@eventsplug.com"
                className="mt-8 py-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/40 text-center text-xs font-bold text-slate-300 hover:text-white transition-all"
              >
                Contact Enterprise
              </a>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center text-slate-500 text-xs font-semibold relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            © 2026 EventsPlug Platform. All secure ledgers reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition">Terms</a>
            <a href="#" className="hover:text-slate-400 transition">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
