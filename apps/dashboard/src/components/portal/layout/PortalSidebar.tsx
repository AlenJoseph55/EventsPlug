"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function PortalSidebar() {
  const {
    user,
    activeTab,
    setActiveTab,
    adminTheme,
    toggleAdminTheme,
    handleLogout,
  } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-bg-panel border-r border-border-main flex flex-col justify-between p-6 antialiased">
      <div>
        <a href="/" className="flex items-center gap-2.5 mb-8 group cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-text-primary text-bg-app flex items-center justify-center font-bold text-xs shadow-xs transition-transform duration-200 group-hover:scale-105">
            ⚡
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-text-primary block font-display">
              EventsPlug
            </span>
            <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
              Console
            </span>
          </div>
        </a>

        <nav className="space-y-1.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
              activeTab === "overview"
                ? "bg-text-primary text-bg-app shadow-xs"
                : "text-text-secondary hover:bg-bg-panel-alt hover:text-text-primary"
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Forms & Widgets
          </button>
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <button
              onClick={() => setActiveTab("create-event")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
                activeTab === "create-event"
                  ? "bg-text-primary text-bg-app shadow-xs"
                  : "text-text-secondary hover:bg-bg-panel-alt hover:text-text-primary"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Create New Form
            </button>
          )}
          <button
            onClick={() => setActiveTab("registrations")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
              activeTab === "registrations"
                ? "bg-text-primary text-bg-app shadow-xs"
                : "text-text-secondary hover:bg-bg-panel-alt hover:text-text-primary"
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Submissions & Data
          </button>
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <button
              onClick={() => setActiveTab("gateways")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
                activeTab === "gateways"
                  ? "bg-text-primary text-bg-app shadow-xs"
                  : "text-text-secondary hover:bg-bg-panel-alt hover:text-text-primary"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Payment Gateways
            </button>
          )}
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <button
              onClick={() => setActiveTab("members")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer ${
                activeTab === "members"
                  ? "bg-text-primary text-bg-app shadow-xs"
                  : "text-text-secondary hover:bg-bg-panel-alt hover:text-text-primary"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Team Members
            </button>
          )}
        </nav>
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

