"use client";

import React from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function PortalHeader() {
  const { user, activeTab, viewMode, adminTheme, toggleAdminTheme } = useAuth();

  if (!user) return null;

  return (
    <header className="h-16 border-b border-border-main px-8 flex items-center justify-between bg-bg-panel/20">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-extrabold capitalize text-text-primary font-display">
          {viewMode === "organizer" ? activeTab.replace("-", " ") : "Master Platform Director"}
        </h2>
      </div>

      {/* Tenant switch context */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">
            Active Tenant Context
          </span>
          <span className="text-sm font-semibold text-text-primary">
            slug: <span className="font-mono text-accent-primary font-semibold">{user.organizationSlug}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
