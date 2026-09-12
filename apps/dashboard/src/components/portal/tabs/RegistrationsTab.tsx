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
  const { registrations, isLoading, exportCsv, cancelRegistration } = useRegistrations(selectedEventId);

  // Filter registrations based on search term
  const filteredRegs = useMemo(() => {
    return registrations.filter((reg) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const answersStr = JSON.stringify(reg.answers || {}).toLowerCase();
      const idStr = reg.id.toLowerCase();
      return answersStr.includes(term) || idStr.includes(term);
    });
  }, [registrations, searchTerm]);

  // Find selected event title
  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedEventTitle = selectedEvent?.title || "";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-panel/40 border border-border-main/50 p-6 rounded-2xl">
        <div>
          <h3 className="text-xl font-black text-text-primary font-display">Submissions & Data Records</h3>
          <p className="text-xs text-text-secondary font-semibold mt-0.5">
            View submitted form entries and export CSV files for external analysis.
          </p>
        </div>

        <button
          onClick={() => exportCsv(selectedEventId, selectedEventTitle)}
          disabled={!selectedEventId || registrations.length === 0}
          className="px-5 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white font-extrabold text-xs tracking-wider transition shadow-md shadow-accent-primary/10 cursor-pointer flex items-center justify-center gap-2 border border-accent-primary/30"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV File
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-bg-panel/40 border border-border-main/50 p-6 rounded-2xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Select Event Form
          </label>
          <select
            className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-2.5 px-4 text-text-primary focus:outline-none focus:border-accent-primary text-xs font-semibold"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.length === 0 && (
              <option value="" className="bg-bg-panel text-text-primary">No event forms available</option>
            )}
            {events.map((evt) => (
              <option key={evt.id} value={evt.id} className="bg-bg-panel text-text-primary">
                {evt.title} ({evt._count?.registrations || 0} responses)
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Search Submissions
          </label>
          <input
            type="text"
            className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-2.5 px-4 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-primary text-xs font-semibold"
            placeholder="Search keywords or answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Registrants Spreadsheet */}
      <div className="bg-bg-panel/40 border border-border-main/50 rounded-2xl p-6">
        {isLoading ? (
          <div className="text-center py-12 text-text-secondary font-display">
            <span className="animate-spin text-lg mr-2 inline-block">🌀</span>
            Loading form responses...
          </div>
        ) : filteredRegs.length === 0 ? (
          <div className="text-center py-12 text-text-secondary border border-dashed border-border-main rounded-xl">
            No form responses found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto bg-bg-panel/20 border border-border-main/30 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main/60 text-text-secondary text-xs font-semibold uppercase bg-bg-panel/40">
                  <th className="py-3 px-4">Response ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Form Answers</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.map((reg: any) => {
                  const answers = reg.answers || {};
                  const dateStr = new Date(reg.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const regStatus = reg.status || "CONFIRMED";
                  const payStatus = reg.paymentStatus;

                  return (
                    <tr key={reg.id} className="border-b border-border-main/20 hover:bg-bg-panel/30 text-sm">
                      <td className="py-4 px-4 font-mono text-xs text-accent-primary">
                        {reg.id}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              regStatus === "CANCELLED"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {regStatus}
                          </span>
                          {payStatus && (
                            <span className="text-[9px] font-mono text-text-muted">
                              Payment: {payStatus}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-text-secondary text-xs font-semibold">
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
                      <td className="py-4 px-4 text-right">
                        {regStatus === "CONFIRMED" ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Cancel registration ${reg.id}? This will free up event capacity and trigger webhook/email notifications.`)) {
                                cancelRegistration(reg.id);
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-text-muted">Cancelled</span>
                        )}
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

