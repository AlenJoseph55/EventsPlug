"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import PortalHeader from "@/components/portal/layout/PortalHeader";

// Import Tabs as Modals
import CreateEventTab from "@/components/portal/tabs/CreateEventTab";
import RegistrationsTab from "@/components/portal/tabs/RegistrationsTab";
import MembersTab from "@/components/portal/tabs/MembersTab";
import ThemesTab from "@/components/portal/tabs/ThemesTab";
import CustomizationTab from "@/components/portal/tabs/CustomizationTab";
import SystemAdminTab from "@/components/portal/tabs/SystemAdminTab";
import MyTicketsTab from "@/components/portal/tabs/MyTicketsTab";

// Import Modals
import EditEventModal from "@/components/portal/modals/EditEventModal";
import DeleteEventModal from "@/components/portal/modals/DeleteEventModal";
import ShareEventModal from "@/components/portal/modals/ShareEventModal";

import { useEvents, EventData } from "@/hooks/useEvents";
import { useAttendeeRegistrations } from "@/hooks/useAttendeeRegistrations";

export default function PortalPage() {
  const {
    token,
    user,
    adminTheme,
    authLoading,
    authError,
    handleLogin,
    clearAuthError,
  } = useAuth();

  // Local state for login inputs
  const [emailInput, setEmailInput] = useState("organizer@hash.edu");
  const [passwordInput, setPasswordInput] = useState("password123");

  // Selection & Modal overlay states
  const { events, isLoading, toggleEventStatus } = useEvents();
  const { registrations: tickets } = useAttendeeRegistrations();
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventData | null>(null);
  const [sharingEvent, setSharingEvent] = useState<EventData | null>(null);
  const [activeModal, setActiveModal] = useState<"create-event" | "registrations" | "customization" | "members" | "themes" | "system" | null>(null);

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    await handleLogin(e, emailInput, passwordInput);
  };

  // If not authenticated, render login panel
  if (!token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-app px-4 font-sans">
        <div className="w-full max-w-md bg-bg-panel/80 backdrop-blur-md border border-border-main p-8 rounded-3xl shadow-2xl animate-fadeIn">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-text-primary tracking-tight font-display">
              EventsPlug <span className="text-accent-primary">Console</span>
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
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder-text-secondary/45 input-interactive focus:outline-none"
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
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder-text-secondary/45 input-interactive focus:outline-none"
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

  const renderHostedEvents = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-text-primary font-display">Your Hosted Events</h3>
          <p className="text-text-secondary text-sm mt-1 font-semibold">
            Manage registration capacities, details, and dynamic widgets for events you host
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary bg-bg-panel border border-border-main rounded-3xl">
            <svg className="animate-spin h-6 w-6 text-accent-primary mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-bold text-text-secondary">Loading hosted events...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {events.map((evt, index) => {
              const dateStr = new Date(evt.date).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const regCount = evt._count?.registrations || 0;
              const isSoldOut = evt.maxRegistrations && regCount >= evt.maxRegistrations;

              return (
                <div
                  key={evt.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="bg-bg-panel border border-border-main rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-200 hover:scale-[1.005] opacity-0 animate-cardEntrance"
                >
                  {/* Event Info / Date badge */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-14 h-14 rounded-2xl bg-bg-panel-alt border border-border-main flex flex-col items-center justify-center flex-shrink-0 text-center">
                      <span className="text-[9px] text-text-secondary font-black uppercase leading-none">
                        {new Date(evt.date).toLocaleDateString(undefined, { month: "short" }).toUpperCase()}
                      </span>
                      <span className="text-lg font-black text-text-primary tracking-tight mt-0.5 leading-none">
                        {new Date(evt.date).getDate()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-text-primary truncate">{evt.title}</h4>
                        <button
                          type="button"
                          onClick={() => toggleEventStatus({ id: evt.id, currentStatus: evt.status || "ACTIVE" })}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase transition border cursor-pointer btn-interactive ${
                            evt.status === "ACTIVE" || !evt.status
                              ? "bg-success-bg/40 text-success-text border-success-border/40"
                              : "bg-bg-panel text-text-secondary border-border-main"
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full ${evt.status === "ACTIVE" || !evt.status ? "bg-success-text animate-pulse" : "bg-text-secondary"}`} />
                          {evt.status === "ACTIVE" || !evt.status ? "Active" : "Inactive"}
                        </button>
                      </div>
                      <p className="text-xs text-text-secondary font-semibold truncate mt-1 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {evt.location}
                        <span className="mx-1 text-text-muted/40">•</span>
                        <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                        </svg>
                        {dateStr}
                      </p>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="w-full md:w-48 flex-shrink-0 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-extrabold text-text-secondary">
                      <span>Registrations</span>
                      <span>{regCount}{evt.maxRegistrations ? ` / ${evt.maxRegistrations}` : " / ∞"}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-bg-panel-alt border border-border-main overflow-hidden">
                      <div
                        style={{
                          width: evt.maxRegistrations
                            ? `${Math.min((regCount / evt.maxRegistrations) * 100, 100)}%`
                            : "5%",
                        }}
                        className={`h-full rounded-full transition-all duration-300 ${isSoldOut ? "bg-rose-500/80" : "bg-accent-primary"}`}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      onClick={() => {
                        setSelectedEventId(evt.id);
                        setActiveModal("registrations");
                      }}
                      className="bg-bg-panel-alt hover:bg-border-main border border-border-main text-text-primary px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 btn-interactive"
                    >
                      <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Registrants
                    </button>
                    <button
                      onClick={() => setEditingEvent(evt)}
                      className="bg-bg-panel-alt hover:bg-border-main border border-border-main text-accent-primary px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 btn-interactive"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setSharingEvent(evt)}
                      className="bg-bg-panel-alt hover:bg-border-main border border-border-main text-text-secondary hover:text-text-primary p-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center w-8 h-8 btn-interactive"
                      title="Share Event"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                    {user.role !== "MEMBER" && (
                      <button
                        onClick={() => setDeletingEvent(evt)}
                        className="bg-bg-panel-alt hover:bg-rose-950/20 hover:text-rose-450 border border-border-main text-rose-400 p-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center w-8 h-8 btn-interactive"
                        title="Delete Event"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Dashed Create Event Card */}
            {user.role !== "MEMBER" && (
              <button
                onClick={() => setActiveModal("create-event")}
                style={{ animationDelay: `${events.length * 50}ms` }}
                className="w-full py-8 border-2 border-dashed border-border-main hover:border-accent-primary/60 rounded-3xl flex flex-col items-center justify-center gap-2 bg-bg-panel/20 hover:bg-bg-panel/40 transition cursor-pointer text-text-secondary hover:text-text-primary group btn-interactive opacity-0 animate-cardEntrance"
              >
                <div className="w-10 h-10 rounded-full bg-bg-panel-alt border border-border-main flex items-center justify-center group-hover:border-accent-primary/50 transition-colors">
                  <svg className="w-5 h-5 text-text-secondary group-hover:text-accent-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-black tracking-tight">Host a New Event</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-primary font-sans relative pb-16 overflow-x-hidden">
      {/* Background Matrix Backdrop Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: `radial-gradient(var(--dot-color) 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
        }}
      />

      {/* Top Header bar */}
      <PortalHeader />

      {/* Centered Card Feed Layout */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12 relative z-10">
        
        {tickets && tickets.length > 0 ? (
          <>
            {/* SECTION 1: Personal RSVP Tickets */}
            <MyTicketsTab />

            {/* Divider */}
            <div className="border-t border-border-main/45 pt-8" />

            {/* SECTION 2: Hosted Events */}
            {renderHostedEvents()}
          </>
        ) : (
          <>
            {/* Prioritize Hosted Events if no active RSVP tickets exist */}
            {renderHostedEvents()}
          </>
        )}

        {/* SECTION 3: Organization & Hub settings card */}
        <div
          style={{ animationDelay: `${(events.length + 1) * 50}ms` }}
          className="bg-bg-panel border border-border-main rounded-3xl p-6 space-y-4 opacity-0 animate-cardEntrance"
        >
          <div>
            <h4 className="text-lg font-bold text-text-primary font-display">Hub Management</h4>
            <p className="text-xs text-text-secondary font-semibold">
              Configure your public directory hub look & feel, custom styling variables, widget themes, and team member access.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveModal("customization")}
              className="bg-bg-panel-alt hover:bg-border-main border border-border-main text-text-primary px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 btn-interactive"
            >
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Customize Standalone Hub
            </button>
            <button
              onClick={() => setActiveModal("themes")}
              className="bg-bg-panel-alt hover:bg-border-main border border-border-main text-text-primary px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 btn-interactive"
            >
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Widget Themes
            </button>
            <button
              onClick={() => setActiveModal("members")}
              className="bg-bg-panel-alt hover:bg-border-main border border-border-main text-text-primary px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 btn-interactive"
            >
              <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Team Collaborators
            </button>
            {user.role === "SUPER_ADMIN" && (
              <button
                onClick={() => setActiveModal("system")}
                className="bg-purple-950/20 hover:bg-purple-900/30 border border-purple-800/40 text-purple-300 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 btn-interactive"
              >
                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Super-Admin Console
              </button>
            )}
          </div>
        </div>

      </main>

      {/* Static Overlay Modals */}
      {editingEvent && (
        <EditEventModal event={editingEvent} onClose={() => setEditingEvent(null)} />
      )}
      {deletingEvent && (
        <DeleteEventModal event={deletingEvent} onClose={() => setDeletingEvent(null)} />
      )}
      {sharingEvent && (
        <ShareEventModal event={sharingEvent} onClose={() => setSharingEvent(null)} />
      )}

      {/* Dynamic Tab Overlay Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-backdropFade">
          <div className="w-full md:max-w-4xl bg-bg-panel border-t md:border border-border-main rounded-t-3xl md:rounded-3xl p-6 shadow-2xl relative max-h-[85vh] md:max-h-[90vh] overflow-y-auto animate-responsiveModal">
            {/* Mobile Bottom Sheet Grab Handle */}
            <div className="w-12 h-1 bg-border-main/80 rounded-full mx-auto mb-4 md:hidden shrink-0" />
            
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl font-semibold cursor-pointer z-10 w-8 h-8 flex items-center justify-center btn-interactive"
            >
              ×
            </button>
            <div className="pt-2">
              {activeModal === "create-event" && (
                <CreateEventTab onBackToOverview={() => setActiveModal(null)} />
              )}
              {activeModal === "registrations" && (
                <RegistrationsTab
                  selectedEventId={selectedEventId}
                  setSelectedEventId={setSelectedEventId}
                />
              )}
              {activeModal === "customization" && <CustomizationTab />}
              {activeModal === "members" && <MembersTab />}
              {activeModal === "themes" && <ThemesTab />}
              {activeModal === "system" && <SystemAdminTab />}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
