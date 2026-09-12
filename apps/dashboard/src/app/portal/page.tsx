"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import PortalHeader from "@/components/portal/layout/PortalHeader";

// Import Tabs as Modals
import CreateEventTab from "@/components/portal/tabs/CreateEventTab";
import RegistrationsTab from "@/components/portal/tabs/RegistrationsTab";
import MembersTab from "@/components/portal/tabs/MembersTab";
import { GatewaysTab } from "@/components/portal/tabs/GatewaysTab";
import ApiKeysTab from "@/components/portal/tabs/ApiKeysTab";
import WebhooksTab from "@/components/portal/tabs/WebhooksTab";

// Import Modals
import EditEventModal from "@/components/portal/modals/EditEventModal";
import DeleteEventModal from "@/components/portal/modals/DeleteEventModal";
import EmbedSnippetModal from "@/components/portal/EmbedSnippetModal";

import { useEvents, EventData } from "@/hooks/useEvents";

export default function PortalPage() {
  const {
    token,
    user,
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
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventData | null>(null);
  const [embedEvent, setEmbedEvent] = useState<EventData | null>(null);
  const [activeModal, setActiveModal] = useState<
    "create-event" | "registrations" | "gateways" | "members" | "api-keys" | "webhooks" | null
  >(null);

  const onSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    await handleLogin(e, emailInput, passwordInput);
  };

  const handleExportCsv = async (evt: EventData) => {
    try {
      const res = await fetch(`http://localhost:5001/api/events/${evt.id}/export-csv`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to export CSV");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${evt.slug}-submissions.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Error exporting CSV data.");
    }
  };

  // If not authenticated, render login panel
  if (!token || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-app px-4 font-sans antialiased">
        <div className="w-full max-w-md bg-bg-panel border border-border-main p-8 sm:p-10 rounded-3xl shadow-xl animate-fadeIn space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-text-primary text-bg-app flex items-center justify-center mx-auto text-lg font-bold shadow-xs">
              ⚡
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight font-display">
              EventsPlug Console
            </h1>
            <p className="text-text-secondary text-xs font-medium">
              Sign in to manage embeddable event widgets & forms
            </p>
          </div>

          <form onSubmit={onSubmitLogin} className="space-y-4 pt-2">
            <div className="space-y-1 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full bg-bg-panel border border-border-main rounded-xl py-2.5 px-3.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary transition"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="block text-xs font-semibold text-text-secondary">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full bg-bg-panel border border-border-main rounded-xl py-2.5 px-3.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-text-primary focus:ring-1 focus:ring-text-primary transition"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>

            {authError && (
              <div className="text-rose-600 text-xs font-semibold bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 rounded-xl">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-text-primary hover:opacity-90 text-bg-app font-semibold py-3 px-4 rounded-xl text-sm transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed pt-2"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary font-display">Your Forms & Widgets</h3>
            <p className="text-text-secondary text-sm mt-1">
              Manage custom fields, embed snippets, API keys, webhooks, and attendee records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal("api-keys")}
              className="bg-bg-panel hover:bg-bg-panel-alt border border-border-main text-text-primary px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>🔑</span>
              API Keys
            </button>
            <button
              onClick={() => setActiveModal("webhooks")}
              className="bg-bg-panel hover:bg-bg-panel-alt border border-border-main text-text-primary px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>🔔</span>
              Webhooks
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary bg-bg-panel border border-border-main rounded-2xl shadow-xs">
            <svg className="animate-spin h-6 w-6 text-text-primary mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-semibold text-text-secondary">Loading form widgets...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map((evt, index) => {
              const regCount = evt._count?.registrations || 0;

              return (
                <div
                  key={evt.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="bg-bg-panel border border-border-main rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative transition-all duration-200 hover:shadow-md opacity-0 animate-cardEntrance"
                >
                  {/* Event Info */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-11 h-11 rounded-xl bg-bg-panel-alt border border-border-main flex items-center justify-center flex-shrink-0 text-lg font-bold">
                      ⚡
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-text-primary truncate">{evt.title}</h4>
                        {evt.status === "CLOSED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition border bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Closed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleEventStatus({ id: evt.id, currentStatus: evt.status || "ACTIVE" })}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition border cursor-pointer ${
                              evt.status === "ACTIVE" || !evt.status
                                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                                : "bg-bg-panel-alt text-text-secondary border-border-main"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${evt.status === "ACTIVE" || !evt.status ? "bg-emerald-500 animate-pulse" : "bg-text-secondary"}`} />
                            {evt.status === "ACTIVE" || !evt.status ? "Active" : "Inactive"}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary font-medium truncate mt-1 flex items-center gap-2">
                        <span>{regCount} Submissions</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-text-primary font-semibold">/e/{user.organizationSlug}/{evt.slug}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      onClick={() => setEmbedEvent(evt)}
                      className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <span>⚡</span>
                      Get Embed Snippet
                    </button>
                    <button
                      onClick={() => handleExportCsv(evt)}
                      className="bg-bg-panel hover:bg-bg-panel-alt border border-border-main text-text-primary px-3.5 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEventId(evt.id);
                        setActiveModal("registrations");
                      }}
                      className="bg-bg-panel hover:bg-bg-panel-alt border border-border-main text-text-primary px-3.5 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      Submissions
                    </button>
                    <button
                      onClick={() => setEditingEvent(evt)}
                      className="bg-bg-panel hover:bg-bg-panel-alt border border-border-main text-text-secondary hover:text-text-primary px-3.5 py-2 rounded-full text-xs font-semibold transition cursor-pointer shadow-2xs"
                    >
                      Edit
                    </button>
                    {user.role !== "MEMBER" && (
                      <button
                        onClick={() => setDeletingEvent(evt)}
                        className="border border-border-main hover:bg-rose-50 dark:hover:bg-rose-950/20 text-text-muted hover:text-rose-600 rounded-full w-8 h-8 flex items-center justify-center transition cursor-pointer shadow-2xs"
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

            {/* Create Form Card */}
            {user.role !== "MEMBER" && (
              <button
                onClick={() => setActiveModal("create-event")}
                className="w-full py-8 border-2 border-dashed border-border-main hover:border-text-primary/40 rounded-2xl flex flex-col items-center justify-center gap-2 bg-bg-panel/40 hover:bg-bg-panel transition cursor-pointer text-text-secondary hover:text-text-primary group shadow-2xs"
              >
                <div className="w-9 h-9 rounded-full bg-bg-panel-alt border border-border-main flex items-center justify-center group-hover:border-text-primary/30 transition-colors">
                  <svg className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-xs font-bold font-display">Create New Widget Form</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-primary font-sans relative pb-16 overflow-x-hidden">
      <PortalHeader />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12 relative z-10">
        {renderHostedEvents()}
      </main>

      {/* Static Overlay Modals */}
      {editingEvent && (
        <EditEventModal event={editingEvent} onClose={() => setEditingEvent(null)} />
      )}
      {deletingEvent && (
        <DeleteEventModal event={deletingEvent} onClose={() => setDeletingEvent(null)} />
      )}
      {embedEvent && (
        <EmbedSnippetModal
          isOpen={!!embedEvent}
          onClose={() => setEmbedEvent(null)}
          orgSlug={user.organizationSlug || "hash2025"}
          eventSlug={embedEvent.slug}
          eventTitle={embedEvent.title}
          eventId={embedEvent.id}
        />
      )}

      {/* Dynamic Tab Overlay Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="w-full md:max-w-4xl bg-bg-panel border-t md:border border-border-main rounded-t-3xl md:rounded-3xl p-6 shadow-2xl relative max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl font-semibold cursor-pointer z-10 w-8 h-8 flex items-center justify-center"
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
              {activeModal === "gateways" && (
                <GatewaysTab
                  organization={{
                    stripeAccountId: (user as any)?.stripeAccountId,
                    razorpayKeyId: (user as any)?.razorpayKeyId,
                    razorpayKeySecret: (user as any)?.razorpayKeySecret,
                  }}
                  token={token}
                />
              )}
              {activeModal === "members" && <MembersTab />}
              {activeModal === "api-keys" && <ApiKeysTab />}
              {activeModal === "webhooks" && <WebhooksTab />}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

