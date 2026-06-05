"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useEvents, EventData } from "@/hooks/useEvents";

interface OverviewTabProps {
  onEditEvent: (event: EventData) => void;
  onDeleteEvent: (event: EventData) => void;
  onShareEvent: (event: EventData) => void;
  onViewRegistrations: (eventId: string) => void;
}

export default function OverviewTab({
  onEditEvent,
  onDeleteEvent,
  onShareEvent,
  onViewRegistrations,
}: OverviewTabProps) {
  const { user, setActiveTab } = useAuth();
  const { events, isLoading, toggleEventStatus } = useEvents();
  const [activeDropdownEventId, setActiveDropdownEventId] = useState<string | null>(null);

  // Close dropdown on clicking anywhere else on page
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownEventId(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
        <span className="animate-spin text-2xl mb-4">🌀</span>
        <span>Loading dashboard analytics and events...</span>
      </div>
    );
  }

  // Compute analytics metrics
  const totalEventsCount = events.length;
  const totalRegistrationsCount = events.reduce(
    (acc, evt) => acc + (evt._count?.registrations || 0),
    0
  );
  
  const averageFillRate = events.length > 0
    ? Math.round(
        (events.reduce((acc, evt) => {
          if (!evt.maxRegistrations) return acc + 100;
          return acc + ((evt._count?.registrations || 0) / evt.maxRegistrations) * 100;
        }, 0) / events.length)
      )
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-b border-border-main/50">
        <div className="space-y-1">
          <div className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">
            Total Active Events
          </div>
          <div className="text-3xl font-extrabold text-text-primary tracking-tight font-display">
            {totalEventsCount}
          </div>
          <div className="text-text-secondary text-xs">
            Widget embed templates configured
          </div>
        </div>

        <div className="space-y-1 md:border-l md:border-border-main/50 md:pl-8">
          <div className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">
            Total Registrations
          </div>
          <div className="text-3xl font-extrabold text-accent-primary tracking-tight font-display">
            {totalRegistrationsCount}
          </div>
          <div className="text-text-secondary text-xs">
            Secured attendee slots
          </div>
        </div>

        <div className="space-y-1 md:border-l md:border-border-main/50 md:pl-8">
          <div className="text-text-secondary text-[10px] font-bold uppercase tracking-wider">
            Average Fill Rate
          </div>
          <div className="text-3xl font-extrabold text-success-text tracking-tight font-display">
            {averageFillRate}%
          </div>
          <div className="text-text-secondary text-xs">
            Combined space reservation index
          </div>
        </div>
      </div>

      {/* Events lists table */}
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-text-primary font-display">Your Managed Events</h3>
            <p className="text-text-secondary text-xs">
              Select any event to view and manage its registration lists
            </p>
          </div>
          {user?.role !== "MEMBER" && (
            <button
              onClick={() => setActiveTab("create-event")}
              className="bg-accent-primary hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              + Create New
            </button>
          )}
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-text-secondary border border-dashed border-border-main rounded-xl">
            No events exist. Click &quot;Create New&quot; above to set up your first event!
          </div>
        ) : (
          <div className="max-md:overflow-x-auto md:overflow-visible bg-bg-panel/40 border border-border-main/50 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main/80 text-text-secondary text-xs font-semibold uppercase bg-bg-panel/20">
                  <th className="py-3.5 px-6">Event Details</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Template Form</th>
                  <th className="py-3.5 px-6">Registrations</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => {
                  const dateStr = new Date(evt.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  return (
                    <tr key={evt.id} className="border-b border-border-main/20 hover:bg-bg-panel/30 text-sm transition-colors">
                      <td className="py-4.5 px-6 font-semibold text-text-primary">
                        <div className="font-semibold">{evt.title}</div>
                        {/* Show event ID or slug in minor styling */}
                        <div className="text-[10px] text-text-secondary font-mono mt-1 opacity-70">
                          {evt.id}
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        {evt.status === "DRAFT" ? (
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border bg-amber-500/10 border-amber-500/30 text-amber-500"
                            title="Draft event - Resume setup to publish"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Draft
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleEventStatus({ id: evt.id, currentStatus: evt.status || "ACTIVE" })}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer border ${
                              evt.status === "ACTIVE" || !evt.status
                                ? "bg-success-bg/40 hover:bg-success-bg/60 text-success-text border-success-border/40"
                                : "bg-bg-panel hover:bg-bg-panel/80 text-text-secondary border-border-main"
                            }`}
                            title="Click to toggle active/inactive status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              evt.status === "ACTIVE" || !evt.status
                                ? "bg-success-text animate-pulse"
                                : "bg-text-secondary"
                            }`} />
                            {evt.status === "ACTIVE" || !evt.status ? "Active" : "Inactive"}
                          </button>
                        )}
                      </td>
                      <td className="py-4.5 px-6 text-text-secondary">{dateStr}</td>
                      <td className="py-4.5 px-6 text-text-secondary">{evt.location}</td>
                      <td className="py-4.5 px-6">
                        <span className="inline-flex text-[10px] font-bold text-accent-primary border border-accent-primary/20 bg-accent-primary/10 px-2 py-0.5 rounded-full uppercase">
                          {evt.formTemplateId || "DEFAULT"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className="font-semibold text-text-primary">
                          {evt._count?.registrations || 0}
                        </span>
                        <span className="text-text-secondary text-xs">
                          {evt.maxRegistrations ? ` / ${evt.maxRegistrations}` : " (unlimited)"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <div className="flex justify-end gap-2 items-center relative">
                          {evt.status === "DRAFT" ? (
                            <button
                              onClick={() => onEditEvent(evt)}
                              className="bg-accent-primary hover:bg-accent-hover border border-accent-primary text-white py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer animate-pulse"
                            >
                              Resume Setup
                            </button>
                          ) : (
                            <button
                              onClick={() => onViewRegistrations(evt.id)}
                              className="bg-bg-panel hover:bg-border-main border border-border-main text-text-primary py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                              View Registrations
                            </button>
                          )}
                          
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownEventId(activeDropdownEventId === evt.id ? null : evt.id);
                              }}
                              className="bg-bg-panel hover:bg-border-main border border-border-main/50 text-text-primary p-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center w-8 h-8 cursor-pointer"
                              title="More actions"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>

                            {activeDropdownEventId === evt.id && (
                              <div 
                                className="absolute right-0 mt-1.5 w-44 rounded-xl bg-bg-panel border border-border-main shadow-xl z-50 py-1.5 overflow-hidden text-left"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    onShareEvent(evt);
                                    setActiveDropdownEventId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-border-main transition flex items-center gap-2 cursor-pointer"
                                >
                                  Share Event
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onShareEvent(evt); // Trigger share or export in page
                                    setActiveDropdownEventId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-border-main transition flex items-center gap-2 cursor-pointer"
                                >
                                  Export CSV
                                </button>
                                
                                {user?.role !== "MEMBER" && (
                                  <>
                                    <div className="border-t border-border-main/50 my-1" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onEditEvent(evt);
                                        setActiveDropdownEventId(null);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-accent-primary hover:bg-border-main hover:text-accent-hover transition flex items-center gap-2 cursor-pointer"
                                    >
                                      Edit Details
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onDeleteEvent(evt);
                                        setActiveDropdownEventId(null);
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-danger-bg/20 hover:text-danger-text transition flex items-center gap-2 cursor-pointer"
                                    >
                                      Delete Event
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
