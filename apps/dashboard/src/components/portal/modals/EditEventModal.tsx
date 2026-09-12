"use client";

import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useEvents, EventData, CustomField } from "@/hooks/useEvents";
import { useToast } from "@/providers/ToastProvider";
import { FORM_TEMPLATES } from "@eventflow/templates";
import { FormTemplateId } from "@eventflow/types";
import RegistrationForm from "@/components/RegistrationForm";
import { useThemes } from "@/hooks/useThemes";

interface EditEventModalProps {
  event: EventData;
  onClose: () => void;
}

const getInitialDeadlineTypeAndCustomVal = (evt: EventData) => {
  if (!evt.registrationDeadline) {
    return { type: "start", custom: "" };
  }
  const dateMs = new Date(evt.date).getTime();
  const deadlineMs = new Date(evt.registrationDeadline).getTime();
  const diffMs = dateMs - deadlineMs;

  if (Math.abs(diffMs) < 1000) {
    return { type: "start", custom: "" };
  }
  if (Math.abs(diffMs - 60 * 60 * 1000) < 1000) {
    return { type: "1h", custom: "" };
  }
  if (Math.abs(diffMs - 6 * 60 * 60 * 1000) < 1000) {
    return { type: "6h", custom: "" };
  }
  if (Math.abs(diffMs - 24 * 60 * 60 * 1000) < 1000) {
    return { type: "24h", custom: "" };
  }

  const d = new Date(evt.registrationDeadline);
  const pad = (num: number) => String(num).padStart(2, "0");
  const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { type: "custom", custom: formatted };
};

export default function EditEventModal({ event, onClose }: EditEventModalProps) {
  const { token, apiBase } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
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

  const { skins, themes } = useThemes();

  // Basic Details Form States
  const [editTitle, setEditTitle] = useState(event.title);
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "INACTIVE" | "CLOSED">(
    (event.status as any) || "ACTIVE"
  );
  const [editDescription, setEditDescription] = useState(event.description);
  const [editDate, setEditDate] = useState("");
  const [editLocation, setEditLocation] = useState(event.location);
  const [editMaxRegistrations, setEditMaxRegistrations] = useState(
    event.maxRegistrations ? String(event.maxRegistrations) : ""
  );
  const [editAutoFitImage, setEditAutoFitImage] = useState(
    event.autoFitImage === null ? "inherit" : String(event.autoFitImage)
  );
  const [editSkinId, setEditSkinId] = useState(event.skinId || "inherit");
  const [editThemeId, setEditThemeId] = useState(event.themeId || "inherit");
  const [editRegistrationTitle, setEditRegistrationTitle] = useState(event.registrationTitle || "Reserve your place");
  const [editRegistrationDescription, setEditRegistrationDescription] = useState(event.registrationDescription || "Complete the form below to confirm your spot.");
  const [editRegistrationButtonLabel, setEditRegistrationButtonLabel] = useState(event.registrationButtonLabel || "Register now");
  const [editFormDensity, setEditFormDensity] = useState<"COMPACT" | "COMFORTABLE">(event.formDensity || "COMFORTABLE");
  const [editIsFeatured, setEditIsFeatured] = useState(!!event.isFeatured);
  const [editDeadlineType, setEditDeadlineType] = useState<"start" | "1h" | "6h" | "24h" | "custom">(() => {
    const init = getInitialDeadlineTypeAndCustomVal(event);
    return init.type as any;
  });
  const [editCustomDeadline, setEditCustomDeadline] = useState(() => {
    const init = getInitialDeadlineTypeAndCustomVal(event);
    return init.custom;
  });
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
    const init = getInitialDeadlineTypeAndCustomVal(event);
    setEditDeadlineType(init.type as any);
    setEditCustomDeadline(init.custom);
    setEditThemeId(event.themeId || "inherit");
    setEditRegistrationTitle(event.registrationTitle || "Reserve your place");
    setEditRegistrationDescription(event.registrationDescription || "Complete the form below to confirm your spot.");
    setEditRegistrationButtonLabel(event.registrationButtonLabel || "Register now");
    setEditFormDensity(event.formDensity || "COMFORTABLE");
  }, [event]);

  // Find the latest live data from query cache to keep fields list reactive
  const liveEvent = events?.find((e) => e.id === event.id) || event;

  // Fields List state — backend returns 'formFields'; 'customFields' is a legacy alias
  const editingFields = liveEvent.formFields ?? liveEvent.customFields ?? [];

  // Modal active tab
  const [activeTab, setActiveTab] = useState<"details" | "fields">(
    event.status === "DRAFT" ? "fields" : "details"
  );
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [showPreview, setShowPreview] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Active field editing state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldLabel, setEditFieldLabel] = useState("");
  const [editFieldPlaceholder, setEditFieldPlaceholder] = useState("");
  const [editFieldType, setEditFieldType] = useState("TEXT");
  const [editFieldRequired, setEditFieldRequired] = useState(false);
  const [editFieldIsIdentity, setEditFieldIsIdentity] = useState(false);
  const [editFieldOptions, setEditFieldOptions] = useState("");



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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error uploading file.";
      setEditError(message);
    } finally {
      setEditUploadingPoster(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    try {
      let calculatedDeadline: string | null = null;
      if (editDate) {
        const eventTime = new Date(editDate).getTime();
        if (editDeadlineType === "start") {
          calculatedDeadline = new Date(eventTime).toISOString();
        } else if (editDeadlineType === "1h") {
          calculatedDeadline = new Date(eventTime - 60 * 60 * 1000).toISOString();
        } else if (editDeadlineType === "6h") {
          calculatedDeadline = new Date(eventTime - 6 * 60 * 60 * 1000).toISOString();
        } else if (editDeadlineType === "24h") {
          calculatedDeadline = new Date(eventTime - 24 * 60 * 60 * 1000).toISOString();
        } else if (editDeadlineType === "custom" && editCustomDeadline) {
          calculatedDeadline = new Date(editCustomDeadline).toISOString();
        }
      }

      const payload: Partial<EventData> = {
        title: editTitle,
        status: editStatus,
        description: editDescription,
        date: new Date(editDate).toISOString(),
        location: editLocation,
        maxRegistrations: editMaxRegistrations ? parseInt(editMaxRegistrations, 10) : undefined,
        isFeatured: editIsFeatured,
        registrationDeadline: calculatedDeadline || undefined,
        autoFitImage: editAutoFitImage === "inherit" ? null : editAutoFitImage === "true",
        posterUrl: editPosterUrl || undefined,
        skinId: editSkinId === "inherit" ? null : editSkinId,
        themeId: editThemeId === "inherit" ? null : editThemeId,
        registrationTitle: editRegistrationTitle,
        registrationDescription: editRegistrationDescription,
        registrationButtonLabel: editRegistrationButtonLabel,
        formDensity: editFormDensity,
      };
      await editEvent({ id: event.id, payload });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save changes.";
      setEditError(message);
    }
  };

  const markFieldAsManual = (fieldId: string) => {
    if (typeof window === "undefined" || !fieldId) return;
    const manualKey = `manual_fields_${event.id}`;
    try {
      const existing = JSON.parse(localStorage.getItem(manualKey) || "[]");
      if (!existing.includes(fieldId)) {
        localStorage.setItem(manualKey, JSON.stringify([...existing, fieldId]));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Field mutations wrappers
  const handleAddQuickField = async (type: string) => {
    let defaultLabel = "";
    let defaultPlaceholder = "";
    let defaultOptions: string[] = [];

    switch (type) {
      case "TEXT":
        defaultLabel = "Full Name";
        defaultPlaceholder = "John Doe";
        break;
      case "EMAIL":
        defaultLabel = "Email Address";
        defaultPlaceholder = "email@example.com";
        break;
      case "NUMBER":
        defaultLabel = "Phone Number";
        defaultPlaceholder = "+1 (555) 000-0000";
        break;
      case "TEXTAREA":
        defaultLabel = "Short Bio";
        defaultPlaceholder = "Tell us about yourself...";
        break;
      case "SELECT":
        defaultLabel = "T-Shirt Size";
        defaultPlaceholder = "Select a size...";
        defaultOptions = ["Small", "Medium", "Large", "XL"];
        break;
      case "CHECKBOX":
        defaultLabel = "I agree to the Event Terms & Conditions";
        break;
      default:
        defaultLabel = "Custom Input";
    }

    try {
      const addedField = await addField({
        eventId: event.id,
        payload: {
          type,
          label: defaultLabel,
          placeholder: defaultPlaceholder || undefined,
          required: false,
          options: defaultOptions,
        },
      });

      // Auto-focus behavior: open newly added field in focus-edit state
      if (addedField && addedField.id) {
        markFieldAsManual(addedField.id);
        startEditingField(addedField);
      }
    } catch (err) {
      console.error("Failed to quick-add field:", err);
    }
  };

  const startEditingField = (field: CustomField) => {
    setEditingFieldId(field.id);
    setEditFieldLabel(field.label);
    setEditFieldPlaceholder(field.placeholder || "");
    setEditFieldType(field.type);
    setEditFieldRequired(field.required);
    setEditFieldIsIdentity(!!field.isIdentityField);

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
          isIdentityField: editFieldType === "EMAIL" ? editFieldIsIdentity : false,
          options: parsedOpts,
        },
      });
      markFieldAsManual(fieldId);
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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    // Clone the row and give it a hard solid background so the browser
    // drag-ghost image is never transparent, regardless of CSS variable resolution.
    const target = e.currentTarget;
    const clone = target.cloneNode(true) as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Detect theme context
    let isLight = false;
    if (typeof window !== "undefined") {
      isLight = document.documentElement.classList.contains("light-admin");
    }

    const background = isLight ? "#ffffff" : "#161a24";
    const color = isLight ? "#111827" : "#f8fafc";
    const border = isLight ? "1px solid rgba(79,110,247,0.35)" : "1px solid rgba(79,110,247,0.45)";
    const shadow = isLight ? "0 8px 24px rgba(0,0,0,0.12)" : "0 8px 24px rgba(0,0,0,0.45)";

    clone.style.cssText = [
      `width: ${rect.width}px`,
      `position: fixed`,
      `top: -9999px`,
      `left: -9999px`,
      `pointer-events: none`,
      `background: ${background}`,
      `color: ${color}`,
      `border: ${border}`,
      `border-radius: 8px`,
      `opacity: 1`,
      `box-shadow: ${shadow}`,
    ].join(";");
    document.body.appendChild(clone);
    e.dataTransfer.setDragImage(clone, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    // Remove the clone after the browser has captured the ghost image
    requestAnimationFrame(() => document.body.removeChild(clone));

    setTimeout(() => {
      setDraggedIndex(idx);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;
    setDragOverIndex(idx);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const listCopy = [...editingFields];
    const draggedItem = listCopy[draggedIndex];
    listCopy.splice(draggedIndex, 1);
    listCopy.splice(dragOverIndex, 0, draggedItem);

    const reorderPayload = listCopy.map((field, index) => ({
      id: field.id,
      order: index + 1,
    }));

    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      await reorderFields({ eventId: event.id, payload: reorderPayload });
      showToast("Fields reordered successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to reorder fields.", "error");
    }
  };

  const handleKeyDownReorder = async (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();

    const nextIdx = e.key === "ArrowUp" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= editingFields.length) return;

    const listCopy = [...editingFields];
    const temp = listCopy[idx];
    listCopy[idx] = listCopy[nextIdx];
    listCopy[nextIdx] = temp;

    const reorderPayload = listCopy.map((field, index) => ({
      id: field.id,
      order: index + 1,
    }));

    try {
      await reorderFields({ eventId: event.id, payload: reorderPayload });
      showToast("Fields reordered successfully!", "success");
      setTimeout(() => {
        const nextButton = document.querySelector(`[data-drag-handle="${nextIdx}"]`) as HTMLElement;
        if (nextButton) nextButton.focus();
      }, 50);
    } catch (err) {
      console.error(err);
      showToast("Failed to reorder fields.", "error");
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

      // Find all OTHER currently active presets
      const otherActivePresets = Object.keys(FORM_TEMPLATES).filter(
        id => id !== presetId && getIsPresetAdded(id)
      );

      // Load manually created/edited fields to protect them from deletion
      let manualIds = new Set<string>();
      if (typeof window !== "undefined") {
        try {
          const list = JSON.parse(localStorage.getItem(`manual_fields_${event.id}`) || "[]");
          manualIds = new Set<string>(list);
        } catch {}
      }

      const fieldsToRemove = editingFields.filter(ef => {
        // Protect manual fields from automated preset cleanup
        if (manualIds.has(ef.id)) return false;

        // Must belong to the preset being removed
        const belongsToRemovedPreset = template.fields.some(tf =>
          ef.label.toLowerCase() === tf.label.toLowerCase() &&
          ef.type.toUpperCase() === tf.type.toUpperCase()
        );
        if (!belongsToRemovedPreset) return false;

        // Must NOT be required by any of the other currently active presets
        const isRequiredByOtherActivePreset = otherActivePresets.some(otherPresetId => {
          const otherTemplate = FORM_TEMPLATES[otherPresetId as FormTemplateId];
          return otherTemplate.fields.some(otf =>
            ef.label.toLowerCase() === otf.label.toLowerCase() &&
            ef.type.toUpperCase() === otf.type.toUpperCase()
          );
        });

        return !isRequiredByOtherActivePreset;
      });

      if (fieldsToRemove.length === 0) {
        showToast("Preset fields are shared with other active presets and were kept.", "info");
        return;
      }

      try {
        await Promise.all(
          fieldsToRemove.map(field =>
            fetch(`${apiBase}/events/${event.id}/fields/${field.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }).then(async res => {
              if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to delete field");
              }
            })
          )
        );
        queryClient.invalidateQueries({ queryKey: ["events"] });
        showToast("Preset fields removed successfully!", "success");
      } catch (err: any) {
        console.error("Failed to remove preset fields:", err);
        showToast(err.message || "Failed to remove preset fields", "error");
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-backdropFade">
      <div className={`relative w-full ${
        activeTab === "details" || !showPreview ? "md:max-w-2xl" : "md:max-w-5xl"
      } bg-bg-panel border-t md:border border-border-main rounded-t-3xl md:rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[85vh] md:max-h-[90vh] transition-all duration-300 animate-responsiveModal`}>
        {/* Mobile Bottom Sheet Grab Handle */}
        <div className="w-12 h-1 bg-border-main/80 rounded-full mx-auto mb-4 md:hidden shrink-0" />
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-main/60">
          <div>
            <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 font-display">
              Edit Event Properties
            </h3>
            <p className="text-text-secondary text-xs mt-1">
              Modify properties below. Changes sync instantly on embed components.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg border border-border-main bg-bg-panel/40 transition cursor-pointer btn-interactive"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border-main/40 mb-6 gap-2 shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === "details"
                  ? "border-accent-primary text-accent-primary font-extrabold"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              Basic Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fields")}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === "fields"
                  ? "border-accent-primary text-accent-primary font-extrabold"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              Registration Form
            </button>
          </div>
          {activeTab === "fields" && (
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className="mb-1.5 px-3 py-1 bg-bg-panel-alt hover:bg-bg-panel-hover border border-border-main text-text-secondary hover:text-text-primary rounded-lg text-xs font-bold transition cursor-pointer btn-interactive select-none"
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          )}
        </div>

        {/* Edit Form */}
        {activeTab === "details" && (
          <form onSubmit={handleEditSubmit} className="space-y-6 animate-fadeIn">
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
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary input-interactive focus:outline-none"
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
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary input-interactive focus:outline-none"
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
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary input-interactive focus:outline-none"
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
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary input-interactive focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide">
                Event Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary input-interactive focus:outline-none cursor-pointer"
              >
                <option value="ACTIVE">Active (Accepting Registrations)</option>
                <option value="INACTIVE">Inactive (Hidden / Draft)</option>
                <option value="CLOSED">Closed (Registration Ended)</option>
              </select>
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

          <div>
            <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide">
              Visual Vibe Override (Skin)
            </label>
            <select
              value={editSkinId}
              onChange={(e) => setEditSkinId(e.target.value)}
              className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition cursor-pointer"
            >
              <option value="inherit">Inherit Hub Setting</option>
              {skins.map((skin) => (
                <option key={skin.id} value={skin.id}>
                  {skin.name}
                </option>
              ))}
            </select>
          </div>

          <section className="space-y-4 rounded-2xl border border-border-main bg-bg-panel-alt/40 p-4 md:p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent-primary">Registration experience</p>
              <h4 className="mt-1 text-sm font-bold text-text-primary">Make this form feel like your event</h4>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">Set a clear invitation, call to action, density, and visual theme. The event page preview updates as soon as you save.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-text-secondary text-[10px] font-bold mb-2 uppercase tracking-wide">Event theme</label>
                <select
                  value={editThemeId}
                  onChange={(e) => setEditThemeId(e.target.value)}
                  className="w-full bg-bg-panel border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition cursor-pointer"
                >
                  <option value="inherit">Inherit hub theme</option>
                  {themes.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-text-secondary text-[10px] font-bold mb-2 uppercase tracking-wide">Field spacing</label>
                <div className="grid grid-cols-2 rounded-xl border border-border-main bg-bg-panel p-1">
                  {(["COMFORTABLE", "COMPACT"] as const).map((density) => (
                    <button
                      key={density}
                      type="button"
                      onClick={() => setEditFormDensity(density)}
                      className={`rounded-lg px-3 py-2 text-[10px] font-bold transition cursor-pointer ${editFormDensity === density ? "bg-accent-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
                    >
                      {density === "COMFORTABLE" ? "Comfortable" : "Compact"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-text-secondary text-[10px] font-bold mb-2 uppercase tracking-wide">Form heading</label>
                <input value={editRegistrationTitle} maxLength={80} onChange={(e) => setEditRegistrationTitle(e.target.value)} className="w-full bg-bg-panel border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary" />
              </div>
              <div>
                <label className="block text-text-secondary text-[10px] font-bold mb-2 uppercase tracking-wide">Button label</label>
                <input value={editRegistrationButtonLabel} maxLength={40} onChange={(e) => setEditRegistrationButtonLabel(e.target.value)} className="w-full bg-bg-panel border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary" />
              </div>
            </div>
            <div>
              <label className="block text-text-secondary text-[10px] font-bold mb-2 uppercase tracking-wide">Supporting copy</label>
              <textarea value={editRegistrationDescription} maxLength={180} rows={2} onChange={(e) => setEditRegistrationDescription(e.target.value)} className="w-full resize-none bg-bg-panel border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary" />
              <p className="mt-1 text-right text-[10px] text-text-muted">{editRegistrationDescription.length}/180</p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide">
                Registration Close Option
              </label>
              <select
                value={editDeadlineType}
                onChange={(e) => setEditDeadlineType(e.target.value as any)}
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-primary transition cursor-pointer"
              >
                <option value="start">At Event Start</option>
                <option value="1h">1 Hour before event</option>
                <option value="6h">6 Hours before event</option>
                <option value="24h">24 Hours before event</option>
                <option value="custom">Custom Date & Time</option>
              </select>
            </div>

            {editDeadlineType === "custom" ? (
              <div>
                <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide">
                  Custom Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none"
                  value={editCustomDeadline}
                  onChange={(e) => setEditCustomDeadline(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="block text-text-secondary text-xs font-bold mb-2 uppercase tracking-wide opacity-50">
                  Calculated Deadline Preview
                </label>
                <div className="w-full bg-bg-panel-alt border border-border-main/50 rounded-xl px-4 py-[11px] text-xs font-semibold text-text-secondary opacity-60">
                  {editDate ? (
                    (() => {
                      const eventTime = new Date(editDate).getTime();
                      let dDate: Date;
                      if (editDeadlineType === "start") dDate = new Date(eventTime);
                      else if (editDeadlineType === "1h") dDate = new Date(eventTime - 60 * 60 * 1000);
                      else if (editDeadlineType === "6h") dDate = new Date(eventTime - 6 * 60 * 60 * 1000);
                      else dDate = new Date(eventTime - 24 * 60 * 60 * 1000);
                      return dDate.toLocaleString();
                    })()
                  ) : (
                    "Please set event date to see preview"
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center justify-between p-4 rounded-xl bg-bg-panel-alt border border-border-main hover:bg-bg-panel-hover transition cursor-pointer select-none">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-text-primary block">Feature this Event</span>
                <span className="text-[10px] text-text-secondary block">
                  Display prominently at the top of your standalone hub directory. Maximum 3 active featured events.
                </span>
                {events.filter((e) => e.isFeatured && e.status === "ACTIVE" && e.id !== event.id).length >= 3 && (
                  <span className="text-[9px] text-amber-500 font-semibold block mt-1">
                    ⚠️ Limit reached (3/3 active featured). To feature this event, you will need to unfeature another active event first.
                  </span>
                )}
              </div>
              <input
                type="checkbox"
                checked={editIsFeatured}
                disabled={events.filter((e) => e.isFeatured && e.status === "ACTIVE" && e.id !== event.id).length >= 3 && !editIsFeatured}
                onChange={(e) => setEditIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary border-border-main bg-bg-panel-alt cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
          </div>

          {/* Save button block */}
          {editError && (
            <div className="p-3 bg-danger-bg border border-danger-border rounded-xl text-xs text-danger-text">
              {editError}
            </div>
          )}

          <div className="flex justify-end gap-3 pb-6 border-b border-border-main/60">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-bg-panel-alt hover:bg-bg-panel-hover border border-border-main/60 text-text-secondary hover:text-text-primary rounded-xl text-xs font-bold transition cursor-pointer btn-interactive"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditing}
              className="px-6 py-2.5 bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg cursor-pointer btn-interactive"
            >
              {isEditing ? "Saving changes..." : "Save Event Details"}
            </button>
          </div>
        </form>
      )}

      {/* Custom Field Builder section */}
      {activeTab === "fields" && (
        <div className={`grid grid-cols-1 ${showPreview ? "lg:grid-cols-12" : ""} gap-6 animate-fadeIn`}>
          {/* Left Column: Form Fields List & Editor */}
          <div className={showPreview ? "lg:col-span-7 space-y-6" : "w-full space-y-6"}>
            
            {/* Header */}
            <div className="flex justify-between items-baseline border-b border-border-main/40 pb-3 mb-4">
              <h4 className="text-base font-bold text-text-primary font-display">
                Custom Registration Form Builder
              </h4>
              <div className="text-xs text-text-secondary font-mono">
                {editingFields.length} / 20 inputs
              </div>
            </div>

            {/* Warning Banner */}
            {liveEvent._count?.registrations !== undefined && liveEvent._count.registrations > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-amber-300 text-xs flex gap-3 leading-normal animate-fadeIn">
                <span className="text-base select-none mt-0.5">⚠️</span>
                <div>
                  <strong className="font-bold block mb-0.5">Attendee Database Connected</strong>
                  This event has <strong>{liveEvent._count.registrations}</strong> submissions. Changes will reflect on live forms immediately.
                </div>
              </div>
            )}

            {/* Inline confirmation popup */}
            {pendingConfirm && (
              <div className="p-3 rounded-xl bg-danger-bg border border-danger-border text-danger-text text-xs flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex gap-2 items-center">
                  <span className="text-sm select-none">⚠️</span>
                  <span>{pendingConfirm.message}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => resolveConfirm(false)}
                    className="px-3 py-1 rounded-lg bg-bg-panel border border-border-main text-text-secondary hover:text-text-primary text-xs font-bold transition cursor-pointer btn-interactive"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => resolveConfirm(true)}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer btn-interactive"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {/* Controls Toolbar: Quick-Add & Presets */}
            <div className="bg-bg-panel-alt/30 border border-border-main/50 rounded-xl p-3.5 space-y-3.5">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[10px] text-text-muted uppercase font-extrabold tracking-wider select-none w-16">
                  Add Field
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { type: "TEXT", label: "Text" },
                    { type: "EMAIL", label: "Email" },
                    { type: "NUMBER", label: "Number" },
                    { type: "TEXTAREA", label: "Long Text" },
                    { type: "SELECT", label: "Dropdown" },
                    { type: "CHECKBOX", label: "Checkbox" },
                  ].map((paletteItem) => (
                    <button
                      key={paletteItem.type}
                      type="button"
                      onClick={() => handleAddQuickField(paletteItem.type)}
                      className="px-2 py-0.5 bg-bg-panel hover:bg-bg-panel-hover border border-border-main hover:border-accent-primary/60 focus-visible:ring-1 focus-visible:ring-accent-primary focus-visible:outline-none rounded-md text-text-primary transition cursor-pointer text-xs font-semibold"
                    >
                      + {paletteItem.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[10px] text-text-muted uppercase font-extrabold tracking-wider select-none w-16">
                  Presets
                </span>
                <div className="flex flex-wrap gap-1 items-center">
                  {[
                    { id: "INDIVIDUAL", label: "Individual" },
                    { id: "TEAM", label: "Team" },
                    { id: "GAMING_TOURNAMENT", label: "Esports" },
                    { id: "WORKSHOP", label: "Workshop" },
                    { id: "HACKATHON", label: "Hackathon" },
                  ].map((preset) => {
                    const isAdded = getIsPresetAdded(preset.id);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            handleRemovePresetFields(preset.id);
                          } else {
                            handleApplyPresetFields(preset.id, "APPEND");
                          }
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition border cursor-pointer focus-visible:ring-1 focus-visible:ring-accent-primary focus-visible:outline-none ${
                          isAdded
                            ? "bg-accent-primary/10 border-accent-primary/30 text-accent-primary"
                            : "bg-bg-panel border-border-main text-text-secondary hover:text-text-primary hover:border-accent-primary/45"
                        }`}
                      >
                        <span>{preset.label}</span>
                        {isAdded && (
                          <span 
                            className="text-xs text-accent-primary/60 hover:text-accent-primary font-bold ml-0.5"
                            title="Remove preset fields"
                          >
                            ×
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fields list */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-xs text-text-secondary uppercase font-bold tracking-wider">
                  Active Form Fields
                </div>
                {editingFields.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFields}
                    className="text-xs text-rose-500 hover:text-rose-600 focus-visible:underline focus-visible:outline-none font-bold transition cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {editingFields.length === 0 ? (
                  <div className="text-center p-6 bg-bg-panel-alt/10 border border-dashed border-border-main/50 rounded-xl text-text-muted text-xs">
                    No fields defined yet.
                  </div>
                ) : (
                  <div className="max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-1 border-t border-border-main/30 mt-2">
                    {editingFields.map((field, idx) => {
                      let opts: string[] = [];
                      try {
                        if (typeof field.options === "string") opts = JSON.parse(field.options);
                        else if (Array.isArray(field.options)) opts = field.options;
                      } catch {
                        opts = [];
                      }

                      const isEditing = editingFieldId === field.id;
                      const isDragged = draggedIndex === idx;
                      const isDropTarget = dragOverIndex === idx && draggedIndex !== null && draggedIndex !== idx;

                      return (
                        <React.Fragment key={field.id || idx}>
                          {/* Animated drop zone — slides open above this item when it's the target */}
                          <div className={`drop-zone-wrapper ${isDropTarget ? "open" : ""}`}>
                            <div className="drop-zone-inner">
                              <div className="drop-zone-indicator" />
                            </div>
                          </div>

                          {/* Field Row */}
                          <div
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDragEnd}
                            onDragEnd={handleDragEnd}
                            className={`group flex flex-col bg-bg-panel border-b border-border-main/30 last:border-0 transition-all duration-200 select-none animate-slideIn ${
                              isDragged ? "drag-placeholder" : "hover:bg-bg-panel-hover/30"
                            }`}
                            style={{
                              animationDelay: `${Math.min(idx * 35, 250)}ms`,
                              animationFillMode: "both",
                            }}
                          >
                            {/* Main Row Content */}
                            <div className="flex items-center gap-3 py-2.5 px-2.5">
                              {/* Label & Details */}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-text-primary truncate flex items-center gap-2">
                                  <span>{field.label}</span>
                                  {field.required && (
                                    <span className="text-rose-400 font-bold select-none" title="Required input">
                                      *
                                    </span>
                                  )}
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-accent-primary/10 text-accent-primary border border-accent-primary/20 uppercase select-none">
                                    {field.type}
                                  </span>
                                  {field.isIdentityField && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase select-none" title="Unique identity field">
                                      Identity
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-text-secondary truncate mt-0.5">
                                  {field.placeholder && `Placeholder: "${field.placeholder}"`}
                                  {field.placeholder && opts.length > 0 && " • "}
                                  {opts.length > 0 && `Choices: ${opts.join(", ")}`}
                                  {!field.placeholder && opts.length === 0 && <span className="opacity-45">No placeholder</span>}
                                </div>
                              </div>

                              {/* Reordering & Controls - Adaptive disclosure: visible on mobile, hover-reveal on desktop */}
                              {!isDragged && (
                                <div className="flex items-center gap-2 shrink-0 opacity-60 lg:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                                  {/* Drag Handle */}
                                  <button
                                    type="button"
                                    onKeyDown={(e) => handleKeyDownReorder(e, idx)}
                                    data-drag-handle={idx}
                                    className="p-2 text-text-secondary hover:text-accent-primary focus-visible:text-accent-primary focus-visible:outline-none transition-all duration-150 cursor-grab active:cursor-grabbing active:scale-110 rounded-lg hover:bg-accent-primary/10 select-none text-base min-h-[38px] min-w-[38px] flex items-center justify-center"
                                    title="Drag to reorder or use Arrow keys"
                                    aria-label={`Reorder field ${field.label}`}
                                  >
                                    ⠿
                                  </button>

                                  <div className="h-4 w-px bg-border-main/50" />

                                  {/* Controls */}
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => startEditingField(field)}
                                      className="text-xs font-bold text-text-secondary hover:text-accent-primary focus-visible:text-accent-primary focus-visible:outline-none transition cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteField(field.id)}
                                      className="text-xs font-bold text-rose-400 hover:text-rose-350 focus-visible:text-rose-350 focus-visible:outline-none transition cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Accordion inline field properties editor */}
                            {!isDragged && (
                              <div className={`grid-transition-wrapper ${isEditing ? "expanded" : ""}`}>
                                <div className="grid-transition-inner">
                                  <div className="p-4 bg-bg-panel-alt/45 border-t border-border-main/30 space-y-3">
                                    <div className="text-xs text-accent-primary font-bold uppercase tracking-wider flex justify-between items-center">
                                      <span>Edit Field Properties</span>
                                      <span className="font-mono text-xs opacity-70">
                                        {editFieldType}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-text-secondary text-xs font-bold mb-1.5 uppercase tracking-wide">
                                          Field Label
                                        </label>
                                        <input
                                          type="text"
                                          value={editFieldLabel}
                                          onChange={(e) => setEditFieldLabel(e.target.value)}
                                          className="w-full bg-bg-panel-alt border border-border-main rounded-lg px-2.5 py-1.5 text-sm text-text-primary placeholder-text-secondary/45 input-interactive focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-text-secondary text-xs font-bold mb-1.5 uppercase tracking-wide">
                                          Placeholder
                                        </label>
                                        <input
                                          type="text"
                                          value={editFieldPlaceholder}
                                          onChange={(e) => setEditFieldPlaceholder(e.target.value)}
                                          className="w-full bg-bg-panel-alt border border-border-main rounded-lg px-2.5 py-1.5 text-sm text-text-primary placeholder-text-secondary/45 input-interactive focus:outline-none"
                                        />
                                      </div>
                                    </div>

                                    {editFieldType === "SELECT" && (
                                      <div>
                                        <label className="block text-text-secondary text-xs font-bold mb-1.5 uppercase tracking-wide">
                                          Dropdown Choices (comma-separated)
                                        </label>
                                        <input
                                          type="text"
                                          value={editFieldOptions}
                                          onChange={(e) => setEditFieldOptions(e.target.value)}
                                          placeholder="PC, Console, Mobile"
                                          className="w-full bg-bg-panel-alt border border-border-main rounded-lg px-2.5 py-1.5 text-sm text-text-primary placeholder-text-secondary/45 input-interactive focus:outline-none"
                                        />
                                      </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1.5">
                                      <div className="flex flex-wrap items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                          <input
                                            type="checkbox"
                                            checked={editFieldRequired}
                                            onChange={(e) => setEditFieldRequired(e.target.checked)}
                                            className="accent-accent-primary rounded border-border-main bg-bg-panel-alt"
                                          />
                                          <span className="text-xs text-text-secondary font-semibold">
                                            Required field
                                          </span>
                                        </label>
                                        {editFieldType === "EMAIL" && (
                                          <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              checked={editFieldIsIdentity}
                                              onChange={(e) => setEditFieldIsIdentity(e.target.checked)}
                                              className="accent-accent-primary rounded border-border-main bg-bg-panel-alt"
                                            />
                                            <span className="text-xs text-amber-500 font-semibold">
                                              Identity Field (prevents duplicates)
                                            </span>
                                          </label>
                                        )}
                                      </div>

                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setEditingFieldId(null)}
                                          className="bg-bg-panel border border-border-main text-text-secondary hover:text-text-primary focus-visible:ring-1 focus-visible:ring-accent-primary focus-visible:outline-none active:scale-[0.97] font-bold py-1 px-3 rounded-lg text-xs transition cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveField(field.id)}
                                          className="bg-accent-primary hover:bg-accent-hover text-white focus-visible:ring-1 focus-visible:ring-accent-primary/60 focus-visible:outline-none active:scale-[0.97] font-bold py-1 px-3 rounded-lg text-xs shadow-sm transition cursor-pointer"
                                        >
                                          Save Details
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })}

                    {/* Trailing drop zone — allows dropping after the last item */}
                    {draggedIndex !== null && (
                      <div
                        className={`drop-zone-wrapper ${dragOverIndex === editingFields.length ? "open" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOverIndex(editingFields.length); }}
                        onDragLeave={() => setDragOverIndex(null)}
                        onDrop={handleDragEnd}
                      >
                        <div className="drop-zone-inner">
                          <div className="drop-zone-indicator" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Live Form Preview */}
            {showPreview && (
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4 self-start animate-fadeIn">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs text-text-secondary uppercase font-bold tracking-wider">
                    Live Preview
                  </span>
                </div>
                
                {/* Clean Abstract Canvas Frame */}
                 <div
                   className="mx-auto w-full border border-border-main bg-bg-panel-alt text-text-primary shadow-lg rounded-2xl p-6 transition-all duration-300 max-w-[340px]"
                   style={{ minHeight: "420px" }}
                 >
                  <div className="mb-6">
                    <h4 className="text-base font-extrabold text-text-primary truncate">
                      {editTitle || event.title || "My Awesome Event"}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1 truncate">
                      {editLocation || event.location || "Location TBD"}
                    </p>
                  </div>
                  
                  <div className="max-h-[380px] overflow-y-auto pr-0.5 scrollbar-thin">
                    <RegistrationForm
                      event={{
                        id: event.id,
                        title: editTitle || event.title,
                        formFields: editingFields.map((f, i) => ({
                          id: f.id,
                          label: f.label,
                          type: f.type as "TEXT" | "EMAIL" | "SELECT" | "CHECKBOX" | "NUMBER" | "TEXTAREA",
                          required: f.required,
                          placeholder: f.placeholder || null,
                          options: f.options,
                          order: i + 1,
                        })),
                      }}
                      preview={true}
                      cardBg="var(--bg-panel-alt)"
                      textColor="var(--text-primary)"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
