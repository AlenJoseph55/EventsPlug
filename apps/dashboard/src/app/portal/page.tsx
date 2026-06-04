"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import PortalSidebar from "@/components/portal/layout/PortalSidebar";
import PortalHeader from "@/components/portal/layout/PortalHeader";

// Import Tabs
import OverviewTab from "@/components/portal/tabs/OverviewTab";
import CreateEventTab from "@/components/portal/tabs/CreateEventTab";
import RegistrationsTab from "@/components/portal/tabs/RegistrationsTab";
import MembersTab from "@/components/portal/tabs/MembersTab";
import ThemesTab from "@/components/portal/tabs/ThemesTab";
import CustomizationTab from "@/components/portal/tabs/CustomizationTab";
import SystemAdminTab from "@/components/portal/tabs/SystemAdminTab";

// Import Modals
import EditEventModal from "@/components/portal/modals/EditEventModal";
import DeleteEventModal from "@/components/portal/modals/DeleteEventModal";
import ShareEventModal from "@/components/portal/modals/ShareEventModal";

import { EventData } from "@/hooks/useEvents";

export default function PortalPage() {
  const {
    token,
    user,
    adminTheme,
    activeTab,
    setActiveTab,
    viewMode,
    authLoading,
    authError,
    handleLogin,
    clearAuthError,
  } = useAuth();

  // Local state for the login inputs
  const [emailInput, setEmailInput] = useState("organizer@hash.edu");
  const [passwordInput, setPasswordInput] = useState("password123");

  // Modal & Selection States
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventData | null>(null);
  const [sharingEvent, setSharingEvent] = useState<EventData | null>(null);

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    await handleLogin(e, emailInput, passwordInput);
  };

  // If not authenticated, render a stunning modern login screen
  if (!token || !user) {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-bg-app px-4 font-sans ${adminTheme === "light" ? "light-admin" : "dark-admin"}`}>
        <div className="w-full max-w-md bg-bg-panel/80 backdrop-blur-md border border-border-main p-8 rounded-3xl shadow-2xl animate-fadeIn">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-accent-primary via-purple-400 to-fuchsia-400 bg-clip-text text-transparent tracking-tight font-display">
              EventsPlug Console
            </h1>
            <p className="text-text-secondary text-sm mt-2 font-medium">
              Sign in to manage your multi-tenant event widgets
            </p>
          </div>

          <form onSubmit={onSubmitLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder-text-secondary/45 focus:outline-none focus:border-accent-primary"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder-text-secondary/45 focus:outline-none focus:border-accent-primary"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>

            {authError && (
              <div className="text-rose-400 text-xs font-semibold bg-rose-955 bg-rose-950/20 border border-rose-900/40 p-3 rounded-xl">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-accent-primary hover:bg-accent-hover text-white font-extrabold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-accent-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? "Authenticating Session..." : "Access Console"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleViewRegistrations = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveTab("registrations");
  };

  // Helper to render the active tab content
  const renderTabContent = () => {
    if (viewMode === "system") {
      return <SystemAdminTab />;
    }

    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            onEditEvent={setEditingEvent}
            onDeleteEvent={setDeletingEvent}
            onShareEvent={setSharingEvent}
            onViewRegistrations={handleViewRegistrations}
          />
        );
      case "create-event":
        return <CreateEventTab onBackToOverview={() => setActiveTab("overview")} />;
      case "registrations":
        return (
          <RegistrationsTab
            selectedEventId={selectedEventId}
            setSelectedEventId={setSelectedEventId}
          />
        );
      case "members":
        return <MembersTab />;
      case "themes":
        return <ThemesTab />;
      case "hub-customization":
        return <CustomizationTab />;
      default:
        return (
          <OverviewTab
            onEditEvent={setEditingEvent}
            onDeleteEvent={setDeletingEvent}
            onShareEvent={setSharingEvent}
            onViewRegistrations={handleViewRegistrations}
          />
        );
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden bg-bg-app text-text-primary font-sans ${adminTheme === "light" ? "light-admin" : "dark-admin"}`}>
      {/* Sidebar Navigation */}
      <PortalSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header bar */}
        <PortalHeader />

        {/* Tab contents */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl w-full mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </main>

      {/* Overlay Modals */}
      {editingEvent && (
        <EditEventModal event={editingEvent} onClose={() => setEditingEvent(null)} />
      )}
      {deletingEvent && (
        <DeleteEventModal event={deletingEvent} onClose={() => setDeletingEvent(null)} />
      )}
      {sharingEvent && (
        <ShareEventModal event={sharingEvent} onClose={() => setSharingEvent(null)} />
      )}
    </div>
  );
}
