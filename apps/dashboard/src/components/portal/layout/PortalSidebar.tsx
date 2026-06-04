"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function PortalSidebar() {
  const {
    user,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    systemTab,
    setSystemTab,
    adminTheme,
    toggleAdminTheme,
    handleLogout,
  } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-bg-panel border-r border-border-main flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center font-bold text-white shadow-sm font-display">
            E
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-text-primary block font-display font-semibold">
              EventsPlug
            </span>
            <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider block">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Segmented Layout Switcher for Organizer / Attendee */}
        <div className="mb-6 p-1.5 rounded-xl bg-bg-panel-alt border border-border-main flex flex-col gap-1.5 shadow-inner">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setViewMode("organizer");
                setActiveTab("overview");
              }}
              className={`flex-1 py-2 text-center text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === "organizer"
                  ? "bg-accent-primary text-white shadow-md shadow-accent-primary/10"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Host Mode
            </button>
            <button
              onClick={() => {
                setViewMode("attendee");
                setActiveTab("my-tickets");
              }}
              className={`flex-1 py-2 text-center text-xs font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === "attendee"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-550/10"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Attendee Mode
            </button>
          </div>
          {user.role === "SUPER_ADMIN" && (
            <button
              onClick={() => {
                setViewMode("system");
                setSystemTab("tenants");
              }}
              className={`w-full py-1.5 text-center text-[11px] font-extrabold rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === "system"
                  ? "bg-purple-650 text-white shadow-md shadow-purple-600/10"
                  : "text-text-secondary hover:text-text-primary border border-purple-500/10"
              }`}
            >
              Master System Director
            </button>
          )}
        </div>

        {viewMode === "organizer" ? (
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                activeTab === "overview"
                  ? "bg-accent-primary text-white shadow-md shadow-accent-primary/10"
                  : "text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Overview
            </button>
            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <button
                onClick={() => setActiveTab("create-event")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                  activeTab === "create-event"
                    ? "bg-accent-primary text-white shadow-md shadow-accent-primary/10"
                    : "text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary"
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Create Event
              </button>
            )}
            <button
              onClick={() => setActiveTab("registrations")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                activeTab === "registrations"
                  ? "bg-accent-primary text-white shadow-md shadow-accent-primary/10"
                  : "text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Registrations
            </button>
            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <>
                <button
                  onClick={() => setActiveTab("members")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                    activeTab === "members"
                      ? "bg-accent-primary text-white shadow-md shadow-accent-primary/10"
                      : "text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Team Members
                </button>
                <button
                  onClick={() => setActiveTab("themes")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                    activeTab === "themes"
                      ? "bg-accent-primary text-white shadow-md shadow-accent-primary/10"
                      : "text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Widget Themes
                </button>
                <button
                  onClick={() => setActiveTab("hub-customization")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                    activeTab === "hub-customization"
                      ? "bg-accent-primary text-white shadow-md shadow-accent-primary/10"
                      : "text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary"
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Standalone Hub
                </button>
              </>
            )}
          </nav>
        ) : viewMode === "attendee" ? (
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("my-tickets")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                activeTab === "my-tickets"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                  : "text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              My Tickets
            </button>
          </nav>
        ) : (
          <nav className="space-y-2">
            <div className="px-4 py-3 rounded-xl text-sm font-extrabold bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/20 dark:border-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Master Control
            </div>
            <div className="px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider pl-4 mt-6 block">
              Core Systems
            </div>
            <button
              onClick={() => setSystemTab("tenants")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                systemTab === "tenants"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                  : "text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Tenant Director
            </button>
            <button
              onClick={() => setSystemTab("themes")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                systemTab === "themes"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                  : "text-text-secondary hover:bg-bg-panel-hover hover:text-text-primary"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Theme Manager
            </button>
          </nav>
        )}
      </div>

      <div>
        {/* Panel Theme Mode Toggle */}
        <div className="mb-4 p-1 rounded-xl bg-bg-panel-alt border border-border-main flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 pl-2">
            {adminTheme === "dark" ? (
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
            <span className="text-[11px] font-bold text-text-primary">Theme</span>
          </div>
          <div className="flex bg-bg-panel-alt p-0.5 rounded-lg border border-border-main">
            <button
              type="button"
              onClick={() => adminTheme !== "light" && toggleAdminTheme()}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                adminTheme === "light"
                  ? "bg-bg-panel text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => adminTheme !== "dark" && toggleAdminTheme()}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                adminTheme === "dark"
                  ? "bg-bg-panel text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* User context & logout */}
        <div className="pt-6 border-t border-border-main">
          <div className="flex items-center gap-3 mb-4 bg-bg-panel border border-border-main p-3 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-accent-primary flex items-center justify-center font-bold text-white text-sm shadow-inner font-display">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-bold text-text-primary block truncate font-display">
                {user.email.split("@")[0].split(/[._-]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")}
              </span>
              <span className="text-[10px] text-text-secondary font-semibold block truncate">
                {user.organizationName} · {user.role === "SUPER_ADMIN" ? "Super-Admin" : user.role === "ADMIN" ? "Admin" : "Member"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-bg-panel-alt hover:bg-danger-bg hover:text-danger-text border border-border-main rounded-xl py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013-3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
