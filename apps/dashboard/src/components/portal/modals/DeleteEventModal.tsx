"use client";

import React, { useState } from "react";
import { useEvents, EventData } from "@/hooks/useEvents";

interface DeleteEventModalProps {
  event: EventData;
  onClose: () => void;
}

export default function DeleteEventModal({ event, onClose }: DeleteEventModalProps) {
  const { deleteEvent, isDeleting } = useEvents();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (deleteConfirmText.trim().toLowerCase() !== event.title.trim().toLowerCase()) {
      setDeleteError("Confirmation text does not match the event title.");
      return;
    }

    try {
      await deleteEvent(event.id);
      onClose();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete event.");
    }
  };

  const isConfirmed = deleteConfirmText.trim().toLowerCase() === event.title.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-md bg-bg-panel border border-border-main rounded-3xl shadow-2xl p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1.5 rounded-lg border border-border-main bg-bg-panel/40 transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Warning Icon Banner */}
        <div className="flex flex-col items-center text-center mt-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner mb-3">
            <svg className="w-5 h-5 text-rose-500/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-rose-400">Delete Event</h3>
          <p className="text-text-secondary text-xs mt-1 px-4 leading-normal font-medium">
            This will permanently remove the event and all associated attendee registration records.
          </p>
        </div>

        <form onSubmit={handleDeleteSubmit} className="space-y-4">
          {/* Warning Box */}
          <div className="p-4 bg-bg-panel-alt/50 border border-border-main rounded-2xl text-xs text-text-primary leading-normal font-medium">
            You are about to delete <strong>{event.title}</strong>. This action cannot be undone and will remove:
            <ul className="list-disc list-inside mt-2 text-[11px] text-text-secondary space-y-1">
              <li>The public widget and registration form</li>
              <li>All <strong>{event._count?.registrations || 0}</strong> registrations</li>
              <li>Associated poster assets</li>
            </ul>
          </div>

          <div>
            <label className="block text-text-secondary text-[10px] font-bold mb-2 uppercase tracking-wider">
              To confirm, please type the event title below:
            </label>
            <div className="text-text-secondary text-[10px] select-all font-mono bg-bg-panel-alt py-1.5 px-3 rounded-lg border border-border-main mb-2">
              {event.title}
            </div>
            <input
              type="text"
              placeholder="Type title exactly to confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              required
              className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-secondary/45 focus:outline-none focus:border-rose-900/60 focus:ring-1 focus:ring-rose-900/20 transition"
            />
          </div>

          {deleteError && (
            <div className="p-3 bg-rose-950/10 border border-rose-900/30 rounded-xl text-xs text-rose-400 font-medium">
              {deleteError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-bg-panel-alt hover:bg-bg-panel-hover border border-border-main/60 text-text-secondary hover:text-text-primary rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting || !isConfirmed}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-30 text-white rounded-xl text-xs font-bold transition shadow-md flex justify-center items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
