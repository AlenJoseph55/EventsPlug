"use client";

import React, { useState } from "react";

export default function Home() {
  // Live Demo Interactive Form State
  const [demoName, setDemoName] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoAttendance, setDemoAttendance] = useState("in-person");
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // Bottom CTA Quick Create State
  const [quickEventName, setQuickEventName] = useState("");

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName || !demoEmail) return;
    setIsSubmittingDemo(true);
    setTimeout(() => {
      setIsSubmittingDemo(false);
      setDemoSubmitted(true);
    }, 800);
  };

  const resetDemo = () => {
    setDemoSubmitted(false);
    setDemoName("");
    setDemoEmail("");
  };

  const handleQuickStart = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickEventName ? `?title=${encodeURIComponent(quickEventName)}` : "";
    window.location.href = `/portal${query}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white antialiased">
      
      {/* Headersticky navigation */}
      <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-neutral-200/80 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-xs">
              ⚡
            </div>
            <span className="text-base font-bold tracking-tight text-neutral-900">
              EventsPlug
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <a href="#how-it-works" className="hover:text-neutral-900 transition">How it works</a>
            <a href="#live-demo" className="hover:text-neutral-900 transition">Live Demo</a>
            <a href="#pricing" className="hover:text-neutral-900 transition">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/portal"
              className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 px-3 py-1.5 transition"
            >
              Sign In
            </a>
            <a
              href="/portal"
              className="text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-full transition shadow-sm"
            >
              Create Event
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 max-w-4xl mx-auto px-6 text-center space-y-8">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-neutral-300/80 bg-white/80 text-neutral-700 text-xs font-medium shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Free for community & free events
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.1]">
            Event signups, <br className="hidden sm:inline" />
            without the bloat.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Paste one simple line into your site or share a direct link. Guests RSVP cleanly, and your attendee list downloads to Excel with one click.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="/portal"
            className="w-full sm:w-auto text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white px-7 py-3.5 rounded-full transition shadow-md hover:shadow-lg text-center"
          >
            Start for free
          </a>
          <a
            href="#live-demo"
            className="w-full sm:w-auto text-sm font-semibold border border-neutral-300/90 bg-white hover:bg-neutral-50 text-neutral-800 px-6 py-3.5 rounded-full transition text-center flex items-center justify-center gap-1.5"
          >
            Try live demo <span>↓</span>
          </a>
        </div>

        {/* Feature Pills Subtext */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-neutral-500 pt-2">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            No code required
          </span>
          <span className="text-neutral-300">•</span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            Squarespace, WordPress & Framer
          </span>
          <span className="text-neutral-300">•</span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
            Instant export
          </span>
        </div>
      </section>

      {/* LIVE DEMO INTERACTIVE CARD PREVIEW */}
      <section id="live-demo" className="max-w-2xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl p-6 sm:p-10 space-y-6 relative overflow-hidden">
          
          {/* Header tag */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              LIVE ATTENDEE EXPERIENCE
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              &lt;events-plug-widget&gt;
            </span>
          </div>

          {!demoSubmitted ? (
            <form onSubmit={handleDemoSubmit} className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                  Design Systems Meetup 2025
                </h3>
                <p className="text-xs text-neutral-500 flex items-center gap-2">
                  <span>Thursday, Nov 14</span>
                  <span>•</span>
                  <span>San Francisco & Virtual</span>
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-neutral-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-neutral-700">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-neutral-700">Attendance Type</label>
                  <select
                    value={demoAttendance}
                    onChange={(e) => setDemoAttendance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                  >
                    <option value="in-person">In-Person Guest (Free)</option>
                    <option value="virtual">Virtual Stream</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingDemo}
                className="w-full text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmittingDemo ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "Confirm RSVP"
                )}
              </button>

              <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span>Powered by EventsPlug</span>
                <span>Saved 10 sec/guest • No account needed</span>
              </div>
            </form>
          ) : (
            <div className="py-8 text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-neutral-900">RSVP Confirmed!</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  You are registered for Design Systems Meetup 2025. Response recorded in organizer database.
                </p>
              </div>
              <button
                onClick={resetDemo}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 underline pt-2"
              >
                Test demo again
              </button>
            </div>
          )}
        </div>
      </section>

      {/* THREE QUIET STEPS SECTION */}
      <section id="how-it-works" className="py-20 bg-[#F5F4EF] border-t border-b border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
              SIMPLICITY BY DESIGN
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              Just three quiet steps.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-neutral-400">01</span>
              <h3 className="text-lg font-bold text-neutral-900">Paste or Share</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Drop a 1-snippet line into Squarespace, WordPress, Notion, Framer, or simply share a clean standalone link.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-neutral-400">02</span>
              <h3 className="text-lg font-bold text-neutral-900">Frictionless RSVPs</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Guests sign up in seconds on a quiet, distraction-free form that loads instantly on any phone or laptop.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <span className="text-xs font-mono font-bold text-neutral-400">03</span>
              <h3 className="text-lg font-bold text-neutral-900">Instant Export</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Your guest list is always yours. Download directly to Google Sheets or Excel anytime with one simple click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT COMPARES TABLE SECTION */}
      <section className="py-20 max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
            HOW IT COMPARES
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            A lighter way to collect RSVPs.
          </h2>
          <p className="text-sm text-neutral-600">
            Built for speed and simplicity, not upsells and ad tracking.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80 text-neutral-500 font-semibold">
                <th className="py-4 px-5">Feature</th>
                <th className="py-4 px-5 text-neutral-900 font-bold bg-neutral-100/80">
                  EventsPlug <span className="text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5 rounded-full ml-1">Dedicated</span>
                </th>
                <th className="py-4 px-5">Eventbrite</th>
                <th className="py-4 px-5">Google Forms</th>
                <th className="py-4 px-5">Typeform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/80 text-neutral-700">
              <tr>
                <td className="py-4 px-5 font-semibold text-neutral-900">Setup speed</td>
                <td className="py-4 px-5 font-medium text-emerald-700 bg-emerald-50/30">✓ Under 1 min (1-line)</td>
                <td className="py-4 px-5 text-neutral-500">15+ mins complex setup</td>
                <td className="py-4 px-5 text-neutral-500">5–10 mins manual</td>
                <td className="py-4 px-5 text-neutral-500">10+ mins builder</td>
              </tr>
              <tr>
                <td className="py-4 px-5 font-semibold text-neutral-900">Attendee experience</td>
                <td className="py-4 px-5 font-medium text-emerald-700 bg-emerald-50/30">✓ 10-second hosted/embed</td>
                <td className="py-4 px-5 text-neutral-500">Mandatory account + fees</td>
                <td className="py-4 px-5 text-neutral-500">Generic desktop form</td>
                <td className="py-4 px-5 text-neutral-500">Multi-step animations</td>
              </tr>
              <tr>
                <td className="py-4 px-5 font-semibold text-neutral-900">Embeds anywhere</td>
                <td className="py-4 px-5 font-medium text-emerald-700 bg-emerald-50/30">✓ 1-line, zero-CSS clash</td>
                <td className="py-4 px-5 text-neutral-500">Bulky iframe / redirects</td>
                <td className="py-4 px-5 text-neutral-500">Rigid iframe</td>
                <td className="py-4 px-5 text-neutral-500">Heavy 1MB+ bundle</td>
              </tr>
              <tr>
                <td className="py-4 px-5 font-semibold text-neutral-900">Attendee ads & spam</td>
                <td className="py-4 px-5 font-medium text-emerald-700 bg-emerald-50/30">✓ Zero ads, no spam</td>
                <td className="py-4 px-5 text-neutral-500">Pushes other events</td>
                <td className="py-4 px-5 text-neutral-500">Google branding</td>
                <td className="py-4 px-5 text-neutral-500">Typeform badge & upsells</td>
              </tr>
              <tr>
                <td className="py-4 px-5 font-semibold text-neutral-900">Data export</td>
                <td className="py-4 px-5 font-medium text-emerald-700 bg-emerald-50/30">✓ 1-click Sheets & CSV</td>
                <td className="py-4 px-5 text-neutral-500">Gated reports</td>
                <td className="py-4 px-5 text-neutral-500">Sheets integration</td>
                <td className="py-4 px-5 text-neutral-500">Exported on Basic</td>
              </tr>
              <tr>
                <td className="py-4 px-5 font-semibold text-neutral-900">Pricing</td>
                <td className="py-4 px-5 font-medium text-emerald-700 bg-emerald-50/30">✓ 100% Free for community</td>
                <td className="py-4 px-5 text-neutral-500">Ticket cuts + fees</td>
                <td className="py-4 px-5 text-neutral-500">Free (generic tool)</td>
                <td className="py-4 px-5 text-neutral-500">$25–$83 / month</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ATTENDEE EXPERIENCE REALITY (VISUAL CARDS) */}
      <section className="py-20 bg-[#F5F4EF] border-t border-neutral-200/80">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
              ATTENDEE EXPERIENCE REALITY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              What your guests actually see on your site
            </h2>
            <p className="text-sm text-neutral-600">
              Most embeds hijack your branding with popups, login gates, and ads. Here&apos;s how they compare in the wild.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* CARD 1: EventsPlug */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-neutral-900 shadow-lg space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
                    ✓ Clean & Seamless Embed
                  </span>
                  <span className="text-xs font-bold bg-neutral-900 text-white px-2.5 py-1 rounded-full">
                    EventsPlug Embed
                  </span>
                </div>

                <div className="bg-[#FAF9F5] p-5 rounded-xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900">Design Systems Salon</span>
                    <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">Free Event</span>
                  </div>
                  <div className="space-y-2">
                    <input disabled placeholder="Jordan Smith" className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded text-xs text-neutral-400" />
                    <input disabled placeholder="jordan@studio.design" className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded text-xs text-neutral-400" />
                    <button disabled className="w-full bg-neutral-900 text-white text-xs py-2 rounded font-semibold">Confirm RSVP (1-click)</button>
                  </div>
                  <p className="text-[10px] text-neutral-400 text-center">Takes 10 seconds • Zero ads • No account required</p>
                </div>
              </div>

              <ul className="space-y-2 text-xs font-medium text-neutral-700">
                <li className="flex items-center gap-2 text-emerald-700">
                  <span>✓</span> Blends into your custom website CSS
                </li>
                <li className="flex items-center gap-2 text-emerald-700">
                  <span>✓</span> Instant signup without leaving the page
                </li>
                <li className="flex items-center gap-2 text-emerald-700">
                  <span>✓</span> Direct 1-click export to Google Sheets & CSV
                </li>
              </ul>
            </div>

            {/* CARD 2: Eventbrite */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-6 flex flex-col justify-between opacity-90">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                    Cluttered & Redirecting
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">
                    Eventbrite
                  </span>
                </div>

                <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 space-y-3 text-center">
                  <p className="text-xs font-bold text-neutral-700">⚠️ Account Required for RSVP</p>
                  <button disabled className="w-full bg-blue-600 text-white text-xs py-2 rounded font-semibold">Continue with Eventbrite</button>
                  <div className="pt-2 border-t border-neutral-200 text-[10px] text-neutral-400">
                    Events you might also like near SF...
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-xs font-medium text-neutral-500">
                <li className="flex items-center gap-2 text-rose-600">
                  <span>✕</span> Mandatory login / account creation
                </li>
                <li className="flex items-center gap-2 text-rose-600">
                  <span>✕</span> Directs attendees away to their marketplace
                </li>
                <li className="flex items-center gap-2 text-rose-600">
                  <span>✕</span> Cluttered interface and unexpected buyer fees
                </li>
              </ul>
            </div>

            {/* CARD 3: Google Forms */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-6 flex flex-col justify-between opacity-90">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                    Rigid & Unbranded
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">
                    Google Forms
                  </span>
                </div>

                <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-200/60 space-y-2">
                  <p className="text-[11px] font-medium text-purple-900 bg-purple-100/70 p-2 rounded">
                    ⚠️ Sign in to Google to save your progress
                  </p>
                  <input disabled placeholder="Your answer" className="w-full px-3 py-1.5 bg-white border border-neutral-200 rounded text-xs text-neutral-400" />
                </div>
              </div>

              <ul className="space-y-2 text-xs font-medium text-neutral-500">
                <li className="flex items-center gap-2 text-amber-700">
                  <span>✕</span> Mandatory Google sign-in prompts
                </li>
                <li className="flex items-center gap-2 text-amber-700">
                  <span>✕</span> Iframe scrollbars & zero style customization
                </li>
                <li className="flex items-center gap-2 text-amber-700">
                  <span>✕</span> Outdated desktop-era typography and layout
                </li>
              </ul>
            </div>

            {/* CARD 4: Typeform */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-6 flex flex-col justify-between opacity-90">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                    Slow & Overengineered
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">
                    Typeform
                  </span>
                </div>

                <div className="bg-neutral-900 text-white p-5 rounded-xl space-y-2 text-left">
                  <p className="text-[10px] text-neutral-400">Question 1 of 5</p>
                  <p className="text-xs font-bold">What is your full name? *</p>
                  <button disabled className="bg-white text-neutral-900 text-[10px] px-3 py-1 rounded font-bold">OK ↵</button>
                </div>
              </div>

              <ul className="space-y-2 text-xs font-medium text-neutral-500">
                <li className="flex items-center gap-2 text-neutral-600">
                  <span>✕</span> 5+ multi-step screens just to RSVP
                </li>
                <li className="flex items-center gap-2 text-neutral-600">
                  <span>✕</span> Heavy, animated page load slows page load
                </li>
                <li className="flex items-center gap-2 text-neutral-600">
                  <span>✕</span> Expensive ($25–$83/mo) to remove watermark
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* BOTTOM CTA FORM SECTION */}
      <section id="pricing" className="py-20 max-w-4xl mx-auto px-6 text-center space-y-8">
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Ready to collect RSVPs?
          </h2>
          <p className="text-sm sm:text-base text-neutral-600">
            Get up your first event page in under a minute. No credit card or developer needed.
          </p>
        </div>

        <form onSubmit={handleQuickStart} className="max-w-md mx-auto flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            placeholder="Your event name..."
            value={quickEventName}
            onChange={(e) => setQuickEventName(e.target.value)}
            className="w-full px-4 py-3 rounded-full border border-neutral-300 bg-white text-sm focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition shadow-xs"
          />
          <button
            type="submit"
            className="w-full sm:w-auto shrink-0 text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-full transition shadow-md"
          >
            Get Started Free
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t border-neutral-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">EventsPlug</span>
            <span>—</span>
            <span>Clean event signups for any website</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/portal" className="hover:text-neutral-900 transition">About</a>
            <a href="#live-demo" className="hover:text-neutral-900 transition">Examples</a>
            <a href="/portal" className="hover:text-neutral-900 transition">Privacy</a>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
