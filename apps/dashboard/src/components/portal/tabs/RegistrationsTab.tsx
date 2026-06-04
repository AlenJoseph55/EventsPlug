"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useRegistrations } from "@/hooks/useRegistrations";

interface RegistrationsTabProps {
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
}

export default function RegistrationsTab({
  selectedEventId,
  setSelectedEventId,
}: RegistrationsTabProps) {
  const { events } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");

  // Select first event if none selected
  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId, setSelectedEventId]);

  // Fetch registrations for the selected event
  const { registrations, isLoading, exportCsv } = useRegistrations(selectedEventId);

  // Filter registrations based on search term
  const filteredRegs = useMemo(() => {
    if (!searchTerm.trim()) return registrations;
    const term = searchTerm.toLowerCase();
    return registrations.filter((reg) => {
      const answersStr = JSON.stringify(reg.answers || {}).toLowerCase();
      const idStr = reg.id.toLowerCase();
      const nameStr = (reg.name || "").toLowerCase();
      const emailStr = (reg.email || "").toLowerCase();
      return (
        answersStr.includes(term) ||
        idStr.includes(term) ||
        nameStr.includes(term) ||
        emailStr.includes(term)
      );
    });
  }, [registrations, searchTerm]);

  // Find selected event title
  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedEventTitle = selectedEvent?.title || "";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Event Select Dropdown & Search & Export */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-bg-panel/40 border border-border-main/50 p-6 rounded-2xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Select Event
          </label>
          <select
            className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-2.5 px-4 text-text-primary focus:outline-none focus:border-accent-primary"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.length === 0 && (
              <option value="" className="bg-bg-panel text-text-primary">No events available</option>
            )}
            {events.map((evt) => (
              <option key={evt.id} value={evt.id} className="bg-bg-panel text-text-primary">
                {evt.title} ({evt._count?.registrations || 0})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Search Registrants
          </label>
          <input
            type="text"
            className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-2.5 px-4 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-primary"
            placeholder="Search by keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <button
            onClick={() => exportCsv(selectedEventId, selectedEventTitle)}
            disabled={!selectedEventId || registrations.length === 0}
            className="w-full bg-accent-primary hover:bg-accent-hover disabled:opacity-40 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md transition-all text-center cursor-pointer disabled:cursor-not-allowed"
          >
            Download CSV Export
          </button>
        </div>
      </div>

      {/* Registrants Spreadsheet */}
      <div className="bg-bg-panel/40 border border-border-main/50 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-text-primary">Attendee Roster</h3>
          <p className="text-text-secondary text-xs">
            List of registered attendees and form answers submitted for this event.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-text-secondary">
            <span className="animate-spin text-lg mr-2 inline-block">🌀</span>
            Loading registrations...
          </div>
        ) : filteredRegs.length === 0 ? (
          <div className="text-center py-12 text-text-secondary border border-dashed border-border-main rounded-xl">
            No registrations found. Share your widget to start collecting submissions!
          </div>
        ) : (
          <div className="overflow-x-auto bg-bg-panel/20 border border-border-main/30 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main/60 text-text-secondary text-xs font-semibold uppercase bg-bg-panel/40">
                  <th className="py-3 px-4">Registration ID</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Form Fields & Responses</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.map((reg) => {
                  const answers = reg.answers || {};
                  const dateStr = new Date(reg.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={reg.id} className="border-b border-border-main/20 hover:bg-bg-panel/30 text-sm">
                      <td className="py-4 px-4 font-mono text-xs text-accent-primary">
                        {reg.id}
                      </td>
                      <td className="py-4 px-4 text-text-secondary">
                        {dateStr}
                      </td>
                      <td className="py-4 px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 py-1">
                          {Object.entries(answers).map(([key, val]) => (
                            <div key={key} className="flex gap-2 text-xs">
                              <span className="text-text-secondary font-semibold">{key}:</span>
                              <span className="text-text-primary">{val !== null && val !== undefined ? String(val) : ""}</span>
                            </div>
                          ))}
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
