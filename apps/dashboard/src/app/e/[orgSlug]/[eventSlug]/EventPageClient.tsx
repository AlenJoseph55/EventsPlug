"use client";

import React, { useState } from "react";
import RegistrationForm from "@/components/RegistrationForm";
import { formatFriendlyDate } from "@/lib/date-utils";

interface EventPageClientProps {
  event: any;
}

export default function EventPageClient({ event }: EventPageClientProps) {
  const [registeredTicket, setRegisteredTicket] = useState<any>(null);

  const accentColor = event.accentColor || "#3b82f6";
  const registeredCount = event._count?.registrations || 0;
  const isFull = event.maxRegistrations && registeredCount >= event.maxRegistrations;
  const deadline = event.registrationDeadline ? new Date(event.registrationDeadline) : event.date ? new Date(event.date) : null;
  const isPastEvent = deadline ? deadline < new Date() : false;

  const buildCalendarUrl = (evt: any) => {
    try {
      if (!evt.date) return "#";
      const eventDate = new Date(evt.date);
      if (isNaN(eventDate.getTime())) return "#";

      const start = eventDate.toISOString().replace(/-|:|\.\d{3}/g, "");
      const end = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000)
        .toISOString()
        .replace(/-|:|\.\d{3}/g, "");

      return (
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(evt.title)}` +
        `&dates=${start}/${end}` +
        `&details=${encodeURIComponent(evt.description || "")}` +
        `&location=${encodeURIComponent(evt.location || "")}`
      );
    } catch {
      return "#";
    }
  };

  const buildWhatsAppUrl = (evt: any) => {
    const shareUrl = typeof window !== "undefined"
      ? window.location.href
      : `https://eventsplug.com/e/${evt.organization.slug}/${evt.slug}`;

    return `https://wa.me/?text=${encodeURIComponent(
      `🎉 I just registered for ${evt.title}!\n\nJoin me here: ${shareUrl}`
    )}`;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden px-4 py-8 md:py-16">
      {/* Background Glow */}
      <div
        style={{ backgroundColor: accentColor }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-15 pointer-events-none"
      />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Details Panel */}
          <div className="md:col-span-7 space-y-6">
            <div className="overflow-hidden relative rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              {event.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.posterUrl}
                  alt={event.title}
                  className="w-full h-auto max-h-[340px] object-cover"
                />
              ) : (
                <div className="w-full h-[160px] flex items-center justify-center relative overflow-hidden bg-slate-900">
                  <span className="text-xl font-bold uppercase tracking-widest text-slate-500 text-center px-6">
                    {event.title}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  {event.title}
                </h1>
                <p className="text-xs font-semibold text-slate-400">
                  Organized by <strong className="text-slate-200">{event.organization.name}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-slate-800 py-4">
                {event.date && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl border border-slate-800 bg-slate-800/50 flex items-center justify-center text-sm shadow">
                      📅
                    </div>
                    <div className="text-[11px]">
                      <div className="font-extrabold uppercase tracking-wide text-slate-400">Date & Time</div>
                      <div className="font-bold text-slate-200">{formatFriendlyDate(event.date)}</div>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl border border-slate-800 bg-slate-800/50 flex items-center justify-center text-sm shadow">
                      📍
                    </div>
                    <div className="text-[11px]">
                      <div className="font-extrabold uppercase tracking-wide text-slate-400">Location</div>
                      <div className="font-bold text-slate-200">{event.location}</div>
                    </div>
                  </div>
                )}
              </div>

              {event.maxRegistrations && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Submissions</span>
                    <span>
                      {isFull
                        ? "Full 🚫"
                        : `${registeredCount} / ${event.maxRegistrations}`}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-slate-800">
                    <div
                      style={{
                        width: `${Math.min((registeredCount / event.maxRegistrations) * 100, 100)}%`,
                        backgroundColor: isFull ? "#ef4444" : accentColor,
                      }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 border-t border-slate-800 pt-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Description</h4>
                <p className="text-xs leading-relaxed text-slate-300 font-medium whitespace-pre-wrap">
                  {event.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="md:col-span-5">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl space-y-4">
              <div className="space-y-1 pb-3 border-b border-slate-800">
                <h3 className="text-base font-extrabold tracking-tight text-slate-200">
                  {event.registrationTitle || "Complete Registration"}
                </h3>
                <p className="text-xs font-medium text-slate-400">
                  {event.registrationDescription || "Fill in your details below."}
                </p>
              </div>

              {isPastEvent ? (
                <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-900/50 text-center space-y-3">
                  <span className="text-3xl block animate-pulse">📅</span>
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                    Registration Closed
                  </h4>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    The registration deadline has passed.
                  </p>
                </div>
              ) : isFull ? (
                <div className="p-6 rounded-2xl bg-red-950/20 border border-red-900/50 text-center space-y-3">
                  <span className="text-3xl block animate-bounce">🚫</span>
                  <h4 className="text-xs font-black text-red-400 uppercase tracking-widest">
                    Form Full
                  </h4>
                  <p className="text-slate-400 text-[10px] leading-relaxed">
                    This form has reached its maximum response capacity.
                  </p>
                </div>
              ) : (
                <RegistrationForm
                  event={event}
                  preview={false}
                  onSubmitSuccess={(ticket) => setRegisteredTicket(ticket)}
                  primaryColor={accentColor}
                  cardBg="rgb(15, 23, 42)"
                  textColor="#f8fafc"
                />
              )}
            </div>
          </div>
        </div>

        <div className="text-center pt-8 pb-2 text-slate-500 select-none">
          <span className="text-[10px] font-mono tracking-wider uppercase">
            Powered by <strong className="font-extrabold text-slate-300">EventsPlug</strong>
          </span>
        </div>
      </div>

      {/* Confirmation Modal */}
      {registeredTicket && (
        <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4 bg-black/70">
          <div className="p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div
              style={{ backgroundColor: accentColor }}
              className="absolute top-0 left-0 right-0 h-1.5"
            />

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-2xl shadow animate-pulse">
              ✓
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black tracking-tight text-white uppercase">Submission Received!</h2>
              <p className="text-xs leading-relaxed font-medium text-slate-300">
                Your response for <strong className="text-white font-black">{event.title}</strong> has been successfully recorded.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={buildCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-extrabold text-[10px] uppercase border border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-200 transition-colors"
              >
                📅 Calendar
              </a>
              <a
                href={buildWhatsAppUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: `${accentColor}20`,
                  color: accentColor,
                  borderColor: `${accentColor}40`,
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border font-extrabold text-[10px] uppercase transition-colors hover:opacity-90"
              >
                🟢 Share
              </a>
            </div>

            <button
              onClick={() => {
                setRegisteredTicket(null);
                if (typeof window !== "undefined") window.location.reload();
              }}
              style={{ backgroundColor: accentColor }}
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-extrabold text-xs transition-all shadow-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

