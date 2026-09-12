"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useAttendeeRegistrations, AttendeeRegistration } from "@/hooks/useAttendeeRegistrations";
import { useAuth } from "@/providers/AuthProvider";

export default function MyTicketsTab() {
  const { registrations, isLoading, isError, refetchRegistrations } = useAttendeeRegistrations();
  const { apiBase } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<AttendeeRegistration | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!selectedTicket) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(selectedTicket.id, {
      margin: 1,
      width: 240,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error("Failed to generate QR code", err));
  }, [selectedTicket]);

  const handleCancelTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to cancel your registration? If you cancel, your spot will be given to the next person on the waitlist.")) {
      return;
    }

    try {
      setIsCancelling(true);
      const res = await fetch(`${apiBase}/registrations/${ticketId}/cancel`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to cancel registration");
      }

      await refetchRegistrations();
      setSelectedTicket(null);
    } catch (err) {
      alert("Failed to cancel registration. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
        <svg className="animate-spin h-7 w-7 text-accent-primary mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-bold text-text-secondary">Loading your tickets and RSVPs...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-2xl">
        Failed to fetch your registrations. Please check your connection.
      </div>
    );
  }

  const formatTicketDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
    return { day, month };
  };

  const renderStatusBadge = (status: AttendeeRegistration["status"]) => {
    switch (status) {
      case "CHECKED_IN":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest font-mono">
            ✓ Checked In
          </span>
        );
      case "WAITLISTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest font-mono">
            ⌛ Waitlisted
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-widest font-mono">
            ✕ Cancelled
          </span>
        );
      case "REGISTERED":
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest font-mono">
            ✓ Confirmed Ticket
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h3 className="text-2xl font-black tracking-tight text-text-primary font-display">Your Registered Tickets</h3>
        <p className="text-text-secondary text-sm mt-1 font-semibold">
          Access your dynamic ticket stubs and scan codes for upcoming check-ins
        </p>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-20 bg-bg-panel/25 border border-dashed border-border-main rounded-3xl flex flex-col items-center justify-center gap-3">
          <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-text-primary">No Tickets Found</h4>
            <p className="text-xs text-text-secondary max-w-sm font-semibold">
              You haven&apos;t registered for any events yet, or registered with a different email address.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {registrations.map((reg, index) => {
            const { day, month } = formatTicketDate(reg.eventDate);

            return (
              <div
                key={reg.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="relative bg-bg-panel border border-border-main rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-200 hover:scale-[1.01] opacity-0 animate-cardEntrance"
              >
                {/* Top/Visual Section */}
                <div className="p-6 flex items-start gap-4">
                  {/* Ticket Date Stub */}
                  <div className="w-16 h-20 rounded-2xl bg-bg-panel-alt border border-border-main flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-text-secondary text-[10px] font-black tracking-wider uppercase">
                      {month}
                    </span>
                    <span className="text-2xl font-extrabold text-text-primary tracking-tighter">
                      {day}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    {renderStatusBadge(reg.status)}
                    <h4 className="text-base font-bold text-text-primary truncate mt-1">{reg.eventTitle}</h4>
                    <p className="text-xs text-text-secondary font-semibold truncate">
                      Hosted by {reg.orgName}
                    </p>
                  </div>
                </div>

                {/* Ticket Divider Stub Cutout Decoration */}
                <div className="relative flex items-center py-2">
                  {/* Left notch */}
                  <div className="absolute -left-3 w-6 h-6 rounded-full bg-bg-app border-r border-border-main z-10"></div>
                  {/* Right notch */}
                  <div className="absolute -right-3 w-6 h-6 rounded-full bg-bg-app border-l border-border-main z-10"></div>
                  {/* Dashed line */}
                  <div className="w-full border-t-2 border-dashed border-border-main/50 mx-4"></div>
                </div>

                {/* Ticket Details/Bottom Footer */}
                <div className="p-6 bg-bg-panel-alt/50 border-t border-border-main/30 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">
                      Ticket Access Code
                    </span>
                    <span className="text-xs font-mono font-bold text-text-primary truncate block">
                      {reg.id}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedTicket(reg)}
                    className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white font-extrabold text-xs tracking-wider transition shadow-md shadow-accent-primary/10 cursor-pointer flex-shrink-0 btn-interactive"
                  >
                    View Scan Pass
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket QR Scan Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4 animate-backdropFade">
          <div className="relative w-full md:max-w-sm bg-bg-panel border-t md:border border-border-main rounded-t-3xl md:rounded-3xl p-6 shadow-2xl space-y-6 text-center animate-responsiveModal">
            {/* Mobile Bottom Sheet Grab Handle */}
            <div className="w-12 h-1 bg-border-main/80 rounded-full mx-auto mb-4 md:hidden shrink-0" />
            
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-xl cursor-pointer w-8 h-8 flex items-center justify-center btn-interactive"
            >
              ×
            </button>

            <div className="space-y-1">
              <span className="text-[10px] text-accent-primary font-extrabold uppercase tracking-widest font-mono">
                {selectedTicket.orgName} Hub
              </span>
              <h4 className="text-lg font-extrabold text-text-primary tracking-tight">
                {selectedTicket.eventTitle}
              </h4>
              <div className="pt-1">{renderStatusBadge(selectedTicket.status)}</div>
            </div>

            {/* Generated QR Pass canvas */}
            <div className="w-48 h-48 bg-white rounded-2xl mx-auto flex items-center justify-center p-3 border shadow-inner">
              {selectedTicket.status === "CANCELLED" ? (
                <div className="text-center space-y-1 select-none text-rose-500">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="text-[10px] font-mono font-extrabold block uppercase tracking-wider text-rose-600">
                    TICKET CANCELLED
                  </span>
                </div>
              ) : qrDataUrl ? (
                <img src={qrDataUrl} alt="Ticket QR Code Pass" className="w-44 h-44 object-contain" />
              ) : (
                <span className="text-xs text-text-secondary animate-pulse">Generating QR Pass...</span>
              )}
            </div>

            <div className="space-y-3 bg-bg-panel-alt p-4 rounded-2xl border border-border-main">
              <div className="text-left text-xs space-y-2 text-text-secondary font-semibold">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                  </svg>
                  <span className="text-text-primary">{new Date(selectedTicket.eventDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-text-primary">{selectedTicket.eventLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-text-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span>ID: <span className="text-text-primary font-mono font-bold">{selectedTicket.id}</span></span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {selectedTicket.status !== "CANCELLED" && (
                <button
                  onClick={() => handleCancelTicket(selectedTicket.id)}
                  disabled={isCancelling}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? "Cancelling..." : "Cancel RSVP"}
                </button>
              )}

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full py-2.5 rounded-xl bg-bg-panel-alt hover:bg-border-main border border-border-main text-text-primary text-xs font-bold transition cursor-pointer btn-interactive"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
