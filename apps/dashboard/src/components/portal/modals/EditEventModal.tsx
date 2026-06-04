"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useEvents, EventData, CustomField } from "@/hooks/useEvents";
import { FORM_TEMPLATES } from "@eventflow/templates";
import { FormTemplateId } from "@eventflow/types";

interface EditEventModalProps {
  event: EventData;
  onClose: () => void;
}

export default function EditEventModal({ event, onClose }: EditEventModalProps) {
  const { token, apiBase } = useAuth();
  const {
    events,
    editEvent,
    isEditing,
    addField,
    deleteField,
    reorderFields,
    applyPresetFields,
    clearAllFields,
    saveField,
  } = useEvents();

  // Basic Details Form States
  const [editTitle, setEditTitle] = useState(event.title);
  const [editDescription, setEditDescription] = useState(event.description);
  const [editDate, setEditDate] = useState("");
  const [editLocation, setEditLocation] = useState(event.location);
  const [editMaxRegistrations, setEditMaxRegistrations] = useState(
    event.maxRegistrations ? String(event.maxRegistrations) : ""
  );
  const [editAutoFitImage, setEditAutoFitImage] = useState(
    event.autoFitImage === null ? "inherit" : String(event.autoFitImage)
  );
  const [editPosterUrl, setEditPosterUrl] = useState(event.posterUrl || "");
  const [editUploadingPoster, setEditUploadingPoster] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Sync date formatting
  useEffect(() => {
    if (event.date) {
      try {
        const d = new Date(event.date);
        const pad = (num: number) => String(num).padStart(2, "0");
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setEditDate(formatted);
      } catch (e) {
        console.error(e);
      }
    }
  }, [event]);

  // Find the latest live data from query cache to keep fields list reactive
  const liveEvent = events?.find((e) => e.id === event.id) || event;

  // Fields List state — backend returns 'formFields'; 'customFields' is a legacy alias
  const editingFields = liveEvent.formFields ?? liveEvent.customFields ?? [];

  // Active field editing state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldLabel, setEditFieldLabel] = useState("");
  const [editFieldPlaceholder, setEditFieldPlaceholder] = useState("");
  const [editFieldType, setEditFieldType] = useState("TEXT");
  const [editFieldRequired, setEditFieldRequired] = useState(false);
  const [editFieldOptions, setEditFieldOptions] = useState("");

  // New field quick-add inputs
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldType, setNewFieldType] = useState("TEXT");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState("");

  // Inline confirmation state (replaces window.confirm to avoid modal focus issues)
  const [pendingConfirm, setPendingConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const requestConfirm = (message: string, onConfirm: () => void) => {
    setPendingConfirm({ message, onConfirm });
  };

  const resolveConfirm = (confirmed: boolean) => {
    if (confirmed && pendingConfirm) pendingConfirm.onConfirm();
    setPendingConfirm(null);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setEditUploadingPoster(true);
    setEditError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${apiBase}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to upload image.");
      }

      const data = await res.json();
      setEditPosterUrl(data.url);
    } catch (err: any) {
      setEditError(err.message || "Error uploading file.");
    } finally {
      setEditUploadingPoster(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    try {
      const payload: Partial<EventData> = {
        title: editTitle,
        description: editDescription,
        date: new Date(editDate).toISOString(),
        location: editLocation,
        maxRegistrations: editMaxRegistrations ? parseInt(editMaxRegistrations, 10) : undefined,
        autoFitImage: editAutoFitImage === "inherit" ? null : editAutoFitImage === "true",
        posterUrl: editPosterUrl || undefined,
      };
      await editEvent({ id: event.id, payload });
      onClose();
    } catch (err: any) {
      setEditError(err.message || "Failed to save changes.");
    }
  };

  // Field mutations wrappers
  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;

    let parsedOpts: string[] = [];
    if (newFieldType === "SELECT" && newFieldOptions) {
      parsedOpts = newFieldOptions.split(",").map((o) => o.trim()).filter(Boolean);
    }

    try {
      await addField({
        eventId: event.id,
        payload: {
          type: newFieldType,
          label: newFieldLabel.trim(),
          placeholder: newFieldPlaceholder.trim() || undefined,
          required: newFieldRequired,
          options: parsedOpts,
        },
      });

      // Clear add form inputs
      setNewFieldLabel("");
      setNewFieldPlaceholder("");
      setNewFieldRequired(false);
      setNewFieldOptions("");
    } catch (err) {
      console.error(err);
    }
  };

  const startEditingField = (field: CustomField) => {
    setEditingFieldId(field.id);
    setEditFieldLabel(field.label);
    setEditFieldPlaceholder(field.placeholder || "");
    setEditFieldType(field.type);
    setEditFieldRequired(field.required);

    let optsStr = "";
    if (field.options) {
      try {
        if (typeof field.options === "string") {
          const parsed = JSON.parse(field.options);
          optsStr = Array.isArray(parsed) ? parsed.join(", ") : field.options;
        } else if (Array.isArray(field.options)) {
          optsStr = field.options.join(", ");
        }
      } catch {
        optsStr = String(field.options);
      }
    }
    setEditFieldOptions(optsStr);
  };

  const handleSaveField = async (fieldId: string) => {
    let parsedOpts: string[] = [];
    if (editFieldType === "SELECT" && editFieldOptions) {
      parsedOpts = editFieldOptions.split(",").map((o) => o.trim()).filter(Boolean);
    }

    try {
      await saveField({
        eventId: event.id,
        fieldId,
        payload: {
          type: editFieldType,
          label: editFieldLabel.trim(),
          placeholder: editFieldPlaceholder.trim() || undefined,
          required: editFieldRequired,
          options: parsedOpts,
        },
      });
      setEditingFieldId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteField = (fieldId: string) => {
    requestConfirm("Delete this field from the registration form?", async () => {
      try {
        await deleteField({ eventId: event.id, fieldId });
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleMoveField = async (idx: number, direction: "up" | "down") => {
    const nextIdx = direction === "up" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= editingFields.length) return;

    const listCopy = [...editingFields];
    // swap elements
    const temp = listCopy[idx];
    listCopy[idx] = listCopy[nextIdx];
    listCopy[nextIdx] = temp;

    // Build payload mapping IDs to new order values
    const reorderPayload = listCopy.map((field, index) => ({
      id: field.id,
      order: index + 1,
    }));

    try {
      await reorderFields({ eventId: event.id, payload: reorderPayload });
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyPresetFields = (presetId: string, mode: "APPEND" | "REPLACE") => {
    const run = async () => {
      try {
        await applyPresetFields({ eventId: event.id, presetId, mode });
      } catch (err) {
        console.error(err);
      }
    };
    if (mode === "REPLACE") {
      requestConfirm("Replace all current fields with this preset? This cannot be undone.", run);
    } else {
      run();
    }
  };

  const getIsPresetAdded = (presetId: string) => {
    const template = FORM_TEMPLATES[presetId as FormTemplateId];
    if (!template) return false;
    return template.fields.every(tf =>
      editingFields.some(ef =>
        ef.label.toLowerCase() === tf.label.toLowerCase() &&
        ef.type.toUpperCase() === tf.type.toUpperCase()
      )
    );
  };

  const handleRemovePresetFields = (presetId: string) => {
    requestConfirm("Remove all fields belonging to this preset from the form?", async () => {
      const template = FORM_TEMPLATES[presetId as FormTemplateId];
      if (!template) return;
      const fieldsToRemove = editingFields.filter(ef =>
        template.fields.some(tf =>
          ef.label.toLowerCase() === tf.label.toLowerCase() &&
          ef.type.toUpperCase() === tf.type.toUpperCase()
        )
      );
      try {
        for (const field of fieldsToRemove) {
          await deleteField({ eventId: event.id, fieldId: field.id });
        }
      } catch (err) {
        console.error("Failed to remove preset fields:", err);
      }
    });
  };

  const handleClearAllFields = () => {
    requestConfirm("Clear ALL custom fields from this event's form? This cannot be undone.", async () => {
      try {
        await clearAllFields(event.id);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-2xl bg-bg-panel border border-border-main rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border-main/60">
          <div>
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 font-display">
              ✏️ Edit Event Properties
            </h3>
            <p className="text-text-secondary text-xs mt-1">
              Modify properties below. Changes sync instantly on embed components.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg border border-border-main bg-bg-panel/40 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleEditSubmit} className="space-y-6">
          {/* Warning Banner */}
          {liveEvent._count?.registrations !== undefined && liveEvent._count.registrations > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-amber-300 text-xs flex gap-3 leading-normal">
              <span className="text-base select-none mt-0.5">⚠️</span>
              <div>
                <strong className="font-bold block mb-0.5">Active Attendee Database</strong>
                This event has <strong>{liveEvent._count.registrations}</strong> submission(s). Refactoring form keys or inputs might cause database fields to mismatch on exports.
              </div>
            </div>
          )}

          {/* Details fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide">
                Event Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide">
                Location / Link
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                required
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide">
                Max Seats Limit
              </label>
              <input
                type="number"
                placeholder="Leave blank for unlimited"
                value={editMaxRegistrations}
                onChange={(e) => setEditMaxRegistrations(e.target.value)}
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              required
              rows={3}
              className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition resize-vertical"
            />
          </div>

          {/* Poster Upload Zone */}
          <div>
            <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide">
              Event Banner Poster
            </label>
            <div className="flex gap-4 items-center">
              {editPosterUrl && (
                <div className="w-24 h-16 rounded-xl border border-border-main bg-bg-panel-alt overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editPosterUrl} alt="Poster" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <label className="relative flex flex-col items-center justify-center border border-dashed border-border-main hover:border-accent-primary rounded-2xl p-4 cursor-pointer bg-bg-panel-alt/50 transition">
                  <span className="text-xs text-text-secondary font-semibold">
                    {editUploadingPoster
                      ? "Uploading image..."
                      : editPosterUrl
                      ? "Replace poster image"
                      : "Upload high-res poster image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePosterUpload}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide">
              Cover Image Size Override (Aspect Ratio)
            </label>
            <select
              value={editAutoFitImage}
              onChange={(e) => setEditAutoFitImage(e.target.value)}
              className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition cursor-pointer"
            >
              <option value="inherit">Inherit Global Setting</option>
              <option value="true">Force Auto-Fit (Preserve aspect ratio)</option>
              <option value="false">Force Cropped Cover (Standard height constraint)</option>
            </select>
          </div>

          {/* Save button block */}
          {editError && (
            <div className="p-3 bg-rose-955 bg-rose-905 bg-rose-950/20 border border-rose-900/40 rounded-xl text-xs text-rose-400">
              {editError}
            </div>
          )}

          <div className="flex justify-end gap-3 pb-6 border-b border-border-main/60">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-bg-panel-alt hover:bg-bg-panel-hover border border-border-main/60 text-text-secondary hover:text-text-primary rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditing}
              className="px-6 py-2.5 bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg cursor-pointer"
            >
              {isEditing ? "Saving changes..." : "Save Event Details"}
            </button>
          </div>
        </form>

        {/* Custom Field Builder section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 font-display">
                🛠️ Custom Registration Form Builder
              </h4>
              <p className="text-text-secondary text-[10px] mt-0.5 font-medium">
                Drag/Reorder, delete, or append custom inputs. Standard cap: 20 inputs.
              </p>
            </div>
            <div className="text-[10px] bg-bg-panel-alt/60 border border-border-main text-text-secondary px-2.5 py-1 rounded-full font-bold">
              {editingFields.length} / 20 Fields
            </div>
          </div>

          {/* Inline confirmation banner — replaces native window.confirm */}
          {pendingConfirm && (
            <div className="mb-4 flex items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs animate-fadeIn">
              <span className="text-amber-400 font-semibold flex items-center gap-2">
                <span className="text-sm select-none">⚠️</span>
                {pendingConfirm.message}
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => resolveConfirm(false)}
                  className="px-3 py-1 rounded-lg bg-bg-panel-alt border border-border-main text-text-secondary hover:text-text-primary text-[10px] font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => resolveConfirm(true)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          {/* Predefined templates bar */}
          <div className="mb-4 p-3 bg-bg-panel-alt/50 border border-border-main rounded-2xl">
            <div className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mb-2 flex justify-between items-center">
              <span>📦 Import / Manage Predefined Presets</span>
              {editingFields.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFields}
                  className="text-[9px] text-rose-400 hover:text-rose-350 font-bold bg-rose-950/20 border border-rose-900/30 px-2.5 py-0.5 rounded transition cursor-pointer"
                >
                  Clear All Fields
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "INDIVIDUAL", label: "Individual", color: "from-blue-605/30 to-blue-705/30 border-blue-805/40" },
                { id: "TEAM", label: "Team", color: "from-amber-605/30 to-amber-705/30 border-amber-805/40" },
                { id: "GAMING_TOURNAMENT", label: "Esports", color: "from-rose-605/30 to-rose-705/30 border-rose-805/40" },
                { id: "WORKSHOP", label: "Workshop", color: "from-teal-605/30 to-teal-705/30 border-teal-805/40" },
                { id: "HACKATHON", label: "Hackathon", color: "from-accent-primary/20 to-accent-primary/30 border-accent-primary/20" },
              ].map((preset) => {
                const isAdded = getIsPresetAdded(preset.id);
                return (
                  <div
                    key={preset.id}
                    className={`flex items-center gap-1 bg-gradient-to-r ${preset.color} border ${
                      isAdded ? "border-emerald-500/80 ring-1 ring-emerald-500/20 shadow-emerald-500/10" : ""
                    } px-2.5 py-1 rounded-xl text-[10px] text-text-primary font-bold shadow-sm transition`}
                  >
                    <span>{isAdded ? `✓ ${preset.label}` : preset.label}</span>
                    <div className="h-3 w-px bg-border-main/50 mx-1" />
                    {isAdded ? (
                      <button
                        type="button"
                        onClick={() => handleRemovePresetFields(preset.id)}
                        className="text-[9px] text-rose-455 text-rose-400 hover:text-rose-350 font-extrabold px-1 rounded transition cursor-pointer"
                        title="Remove this preset's fields"
                      >
                        Remove
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApplyPresetFields(preset.id, "APPEND")}
                          className="text-[9px] text-emerald-400 hover:text-emerald-350 font-extrabold px-1 rounded transition cursor-pointer"
                          title="Append fields to active form"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPresetFields(preset.id, "REPLACE")}
                          className="text-[9px] text-rose-455 text-rose-400 hover:text-rose-350 font-extrabold px-1 rounded transition cursor-pointer"
                          title="Replace all fields with this preset"
                        >
                          Set
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fields list */}
          {editingFields.length === 0 ? (
            <div className="text-center p-6 bg-bg-panel-alt/30 border border-dashed border-border-main rounded-2xl text-text-secondary text-xs">
              No custom fields defined. Select a preset template or add fields below.
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {editingFields.map((field, idx) => {
                if (editingFieldId === field.id) {
                  return (
                    <div
                      key={field.id || idx}
                      className="p-4 bg-bg-panel border border-accent-primary/30 rounded-2xl space-y-3 shadow-md shadow-accent-primary/5"
                    >
                      <div className="text-[10px] text-accent-primary font-bold uppercase tracking-wider flex justify-between items-center">
                        <span>✏️ Edit Field: {field.label}</span>
                        <span className="bg-accent-primary/10 px-2 py-0.5 rounded border border-accent-primary/20 font-mono text-[9px]">
                          {editFieldType}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-text-secondary text-[9px] uppercase font-bold mb-1">
                            Field Label
                          </label>
                          <input
                            type="text"
                            value={editFieldLabel}
                            onChange={(e) => setEditFieldLabel(e.target.value)}
                            className="w-full bg-bg-panel-alt border border-border-main rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder-text-secondary/45 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-text-secondary text-[9px] uppercase font-bold mb-1">
                            Placeholder
                          </label>
                          <input
                            type="text"
                            value={editFieldPlaceholder}
                            onChange={(e) => setEditFieldPlaceholder(e.target.value)}
                            className="w-full bg-bg-panel-alt border border-border-main rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder-text-secondary/45 focus:outline-none"
                          />
                        </div>
                      </div>

                      {editFieldType === "SELECT" && (
                        <div>
                          <label className="block text-text-secondary text-[9px] uppercase font-bold mb-1">
                            Dropdown Choices (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={editFieldOptions}
                            onChange={(e) => setEditFieldOptions(e.target.value)}
                            placeholder="PC, Console, Mobile"
                            className="w-full bg-bg-panel-alt border border-border-main rounded-lg px-2.5 py-1.5 text-xs text-text-primary placeholder-text-secondary/45 focus:outline-none"
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-1.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editFieldRequired}
                            onChange={(e) => setEditFieldRequired(e.target.checked)}
                            className="accent-accent-primary rounded border-border-main bg-bg-panel-alt"
                          />
                          <span className="text-xs text-text-secondary font-semibold">
                            Mark field as Required
                          </span>
                        </label>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingFieldId(null)}
                            className="bg-bg-panel-alt hover:bg-bg-panel-hover border border-border-main text-text-secondary font-bold py-1 px-3 rounded-lg text-[10px] transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveField(field.id)}
                            className="bg-accent-primary hover:bg-accent-hover text-white font-bold py-1 px-3 rounded-lg text-[10px] shadow-sm transition cursor-pointer"
                          >
                            Save Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                let opts: string[] = [];
                try {
                  if (typeof field.options === "string") opts = JSON.parse(field.options);
                  else if (Array.isArray(field.options)) opts = field.options;
                } catch {
                  opts = [];
                }

                return (
                  <div
                    key={field.id || idx}
                    className="flex items-center gap-3 p-2.5 bg-bg-panel-alt border border-border-main/60 rounded-xl"
                  >
                    {/* Type badge */}
                    <div className="shrink-0 font-mono text-[9px] text-accent-primary font-bold bg-accent-primary/10 px-2 py-0.5 rounded border border-accent-primary/20 uppercase">
                      {field.type}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-text-primary truncate flex items-center gap-1.5">
                        {field.label}
                        {field.required && (
                          <span className="text-[9px] bg-rose-950/40 border border-rose-900/50 text-rose-400 px-1 rounded uppercase font-bold">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-text-secondary truncate mt-0.5 font-medium">
                        {field.placeholder ? `Placeholder: "${field.placeholder}"` : "No placeholder"}
                        {opts.length > 0 && ` | Choices: [${opts.join(", ")}]`}
                      </div>
                    </div>

                    {/* Reordering */}
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveField(idx, "up")}
                        className="px-2 py-0.5 rounded bg-bg-panel hover:bg-bg-panel-hover border border-border-main text-text-secondary hover:text-text-primary text-[10px] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === editingFields.length - 1}
                        onClick={() => handleMoveField(idx, "down")}
                        className="px-2 py-0.5 rounded bg-bg-panel hover:bg-bg-panel-hover border border-border-main text-text-secondary hover:text-text-primary text-[10px] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditingField(field)}
                        className="p-1 rounded bg-bg-panel hover:bg-bg-panel-hover border border-border-main text-text-secondary hover:text-text-primary transition text-xs cursor-pointer"
                        title="Edit Field Settings"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteField(field.id)}
                        className="p-1 rounded bg-rose-955 bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900/30 text-rose-400 transition text-xs cursor-pointer"
                        title="Delete Field"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick-add form */}
          <form onSubmit={handleAddField} className="mt-4 p-4 bg-bg-panel-alt/30 border border-border-main rounded-2xl space-y-3">
            <div className="text-xs font-bold text-text-primary font-display">
              ➕ Add Custom Registration Input
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-text-secondary text-[9px] uppercase font-bold mb-1">
                  Field Type
                </label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value)}
                  className="w-full bg-bg-panel-alt border border-border-main rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none cursor-pointer"
                >
                  <option value="TEXT" className="bg-bg-panel text-text-primary">Text Input</option>
                  <option value="EMAIL" className="bg-bg-panel text-text-primary">Email Address</option>
                  <option value="NUMBER" className="bg-bg-panel text-text-primary">Number Input</option>
                  <option value="TEXTAREA" className="bg-bg-panel text-text-primary">Text Area</option>
                  <option value="SELECT" className="bg-bg-panel text-text-primary">Dropdown Choices</option>
                  <option value="CHECKBOX" className="bg-bg-panel text-text-primary">Checkbox (T&C Agreement)</option>
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-[9px] uppercase font-bold mb-1">
                  Field Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. In-Game Name"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="w-full bg-bg-panel-alt border border-border-main rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-secondary/45 focus:outline-none"
                />
              </div>
            </div>

            {newFieldType === "SELECT" && (
              <div>
                <label className="block text-text-secondary text-[9px] uppercase font-bold mb-1">
                  Dropdown Choices (comma-separated)
                </label>
                <input
                  type="text"
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  placeholder="e.g. PC, Playstation, Xbox, Mobile"
                  className="w-full bg-bg-panel-alt border border-border-main rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-secondary/45 focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-text-secondary text-[9px] uppercase font-bold mb-1">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enter your IGN alias..."
                  value={newFieldPlaceholder}
                  onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                  className="w-full bg-bg-panel-alt border border-border-main rounded-lg px-3 py-2 text-xs text-text-primary placeholder-text-secondary/45 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-5 select-none">
                <input
                  type="checkbox"
                  id="new-field-required"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                  className="accent-accent-primary rounded border-border-main bg-bg-panel-alt cursor-pointer"
                />
                <label htmlFor="new-field-required" className="text-xs text-text-secondary font-semibold cursor-pointer">
                  Mark as Required field
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Add Field
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
