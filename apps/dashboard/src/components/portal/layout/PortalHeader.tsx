"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useEvents } from "@/hooks/useEvents";

export default function PortalHeader() {
  const { user, handleLogout, adminTheme, toggleAdminTheme } = useAuth();
  const { events } = useEvents();

  if (!user) return null;

  const displayUserEmail = user.email.split("@")[0].split(/[._-]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

  const onLogoutClick = () => {
    const hasEvents = events && events.length > 0;
    const orgSlug = user?.organizationSlug;
    if (hasEvents && orgSlug) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = `/o/${orgSlug}`;
    } else {
      handleLogout();
    }
  };

  return (
    <header className="h-16 border-b border-border-main/50 bg-bg-panel/40 backdrop-blur-md sticky top-0 z-50 px-6 md:px-8">
      <div className="max-w-5xl mx-auto w-full h-full flex items-center justify-between">
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center font-bold text-white shadow-sm font-display transition-transform duration-300 group-hover:scale-105">
            E
          </div>
          <span className="font-extrabold text-base tracking-tight text-text-primary font-display hidden sm:block">
            EventsPlug
          </span>
        </div>

        {/* Right User Actions & Logout */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleAdminTheme}
            className="p-2 rounded-xl bg-bg-panel-alt border border-border-main text-text-secondary hover:text-text-primary transition cursor-pointer flex items-center justify-center w-9 h-9 group btn-interactive"
            title="Toggle theme"
          >
            {adminTheme === "dark" ? (
              <svg className="w-4 h-4 text-amber-500 transition-transform duration-300 group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-indigo-400 transition-transform duration-300 group-hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* User Info */}
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-text-primary block font-display leading-tight">
              {displayUserEmail}
            </span>
            <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block">
              {user.organizationName}
            </span>
          </div>

          {/* Logout Action Button */}
          <button
            onClick={onLogoutClick}
            className="bg-bg-panel-alt hover:bg-rose-950/20 hover:text-rose-400 border border-border-main rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 btn-interactive group"
          >
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013-3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
