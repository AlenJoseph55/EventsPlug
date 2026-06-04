"use client";

import React from "react";
import Link from "next/link";

export default function EventNotFound() {
  return (
    <main className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative glowing gradient blur elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 text-center max-w-md w-full space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-3xl shadow-lg">
          🔍
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight">Event Not Found</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            The event registration page you are looking for does not exist, has expired, or was removed by the organizer.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            🏠 Back to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
