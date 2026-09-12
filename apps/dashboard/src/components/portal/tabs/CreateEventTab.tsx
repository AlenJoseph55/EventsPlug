"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useEvents, EventData, CustomField } from "@/hooks/useEvents";
import { FORM_TEMPLATES } from "@eventflow/templates";
import { FormTemplateId } from "@eventflow/types";
import RegistrationForm from "@/components/RegistrationForm";

interface CreateEventTabProps {
  onBackToOverview: () => void;
}

export default function CreateEventTab({ onBackToOverview }: CreateEventTabProps) {
  const { token, apiBase, user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const {
    events,
    createEvent,
    isCreating,
    editEvent,
    isEditing,
    addField,
    deleteField,
    reorderFields,
    applyPresetFields,
    clearAllFields,
    saveField,
  } = useEvents();

  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [maxRegistrations, setMaxRegistrations] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [deadlineType, setDeadlineType] = useState<"start" | "1h" | "6h" | "24h" | "custom">("start");
  const [customDeadline, setCustomDeadline] = useState("");
  const [wizardAutoFitImage, setWizardAutoFitImage] = useState("inherit");
  const [formTemplateId, setFormTemplateId] = useState("INDIVIDUAL");

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState("");
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [createdEvent, setCreatedEvent] = useState<EventData | null>(null);
  const [qrUrl, setQrUrl] = useState("");

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPosterFile(file);
    setUploadingPoster(true);
    setWizardError(null);

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
      setPosterUrl(data.url);
    } catch (err: any) {
      setWizardError(err.message || "Error uploading file.");
      setPosterFile(null);
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleCreateDraftEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setWizardError(null);

    let calculatedDeadline: string | undefined = undefined;
    if (date) {
      const eventTime = new Date(date).getTime();
      if (deadlineType === "start") {
        calculatedDeadline = new Date(eventTime).toISOString();
      } else if (deadlineType === "1h") {
        calculatedDeadline = new Date(eventTime - 60 * 60 * 1000).toISOString();
      } else if (deadlineType === "6h") {
        calculatedDeadline = new Date(eventTime - 6 * 60 * 60 * 1000).toISOString();
      } else if (deadlineType === "24h") {
        calculatedDeadline = new Date(eventTime - 24 * 60 * 60 * 1000).toISOString();
      } else if (deadlineType === "custom" && customDeadline) {
        calculatedDeadline = new Date(customDeadline).toISOString();
      }
    }

    const payload = {
      title,
      description,
      date: new Date(date).toISOString(),
      location,
      posterUrl: posterUrl || undefined,
      maxRegistrations: maxRegistrations ? parseInt(maxRegistrations, 10) : undefined,
      registrationDeadline: calculatedDeadline,
      templatePreset: formTemplateId,
    };


    try {
      let eventData;
      if (createdEvent) {
        eventData = await editEvent({ id: createdEvent.id, payload });
      } else {
        eventData = await createEvent(payload);
      }
      setCreatedEvent(eventData);
      setWizardStep(2);
    } catch (err: any) {
      setWizardError(err.message || "An unexpected error occurred.");
    }
  };

  // Step 2 Form Customization States
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
  const [editFieldOptions, setEditFieldOptions] = useState("");

  // Inline confirmation state
  const [pendingConfirm, setPendingConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Live fields tracking
  const liveEvent = events?.find((e) => e.id === createdEvent?.id) || createdEvent;
  const editingFields = liveEvent?.formFields ?? liveEvent?.customFields ?? [];

  const requestConfirm = (message: string, onConfirm: () => void) => {
    setPendingConfirm({ message, onConfirm });
  };

  const resolveConfirm = (confirmed: boolean) => {
    if (confirmed && pendingConfirm) pendingConfirm.onConfirm();
    setPendingConfirm(null);
  };

  const markFieldAsManual = (fieldId: string) => {
    if (typeof window === "undefined" || !fieldId || !createdEvent) return;
    const manualKey = `manual_fields_${createdEvent.id}`;
    try {
      const existing = JSON.parse(localStorage.getItem(manualKey) || "[]");
      if (!existing.includes(fieldId)) {
        localStorage.setItem(manualKey, JSON.stringify([...existing, fieldId]));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddQuickField = async (type: string) => {
    if (!createdEvent) return;
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
        eventId: createdEvent.id,
        payload: {
          type,
          label: defaultLabel,
          placeholder: defaultPlaceholder || undefined,
          required: false,
          options: defaultOptions,
        },
      });

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
    if (!createdEvent) return;
    let parsedOpts: string[] = [];
    if (editFieldType === "SELECT" && editFieldOptions) {
      parsedOpts = editFieldOptions.split(",").map((o) => o.trim()).filter(Boolean);
    }

    try {
      await saveField({
        eventId: createdEvent.id,
        fieldId,
        payload: {
          type: editFieldType,
          label: editFieldLabel.trim(),
          placeholder: editFieldPlaceholder.trim() || undefined,
          required: editFieldRequired,
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
    if (!createdEvent) return;
    requestConfirm("Delete this field from the registration form?", async () => {
      try {
        await deleteField({ eventId: createdEvent.id, fieldId });
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    const target = e.currentTarget;
    const clone = target.cloneNode(true) as HTMLElement;
    const rect = target.getBoundingClientRect();
    
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
    if (!createdEvent || draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
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
      await reorderFields({ eventId: createdEvent.id, payload: reorderPayload });
      showToast("Fields reordered successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to reorder fields.", "error");
    }
  };

  const handleKeyDownReorder = async (e: React.KeyboardEvent, idx: number) => {
    if (!createdEvent || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
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
      await reorderFields({ eventId: createdEvent.id, payload: reorderPayload });
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
    if (!createdEvent) return;
    const run = async () => {
      try {
        await applyPresetFields({ eventId: createdEvent.id, presetId, mode });
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
    if (!createdEvent) return;
    requestConfirm("Remove all fields belonging to this preset from the form?", async () => {
      const template = FORM_TEMPLATES[presetId as FormTemplateId];
      if (!template) return;

      const otherActivePresets = Object.keys(FORM_TEMPLATES).filter(
        id => id !== presetId && getIsPresetAdded(id)
      );

      let manualIds = new Set<string>();
      if (typeof window !== "undefined") {
        try {
          const list = JSON.parse(localStorage.getItem(`manual_fields_${createdEvent.id}`) || "[]");
          manualIds = new Set<string>(list);
        } catch {}
      }

      const fieldsToRemove = editingFields.filter(ef => {
        if (manualIds.has(ef.id)) return false;

        const belongsToRemovedPreset = template.fields.some(tf =>
          ef.label.toLowerCase() === tf.label.toLowerCase() &&
          ef.type.toUpperCase() === tf.type.toUpperCase()
        );
        if (!belongsToRemovedPreset) return false;

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
            fetch(`${apiBase}/events/${createdEvent.id}/fields/${field.id}`, {
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
    if (!createdEvent) return;
    requestConfirm("Clear ALL custom fields from this event's form? This cannot be undone.", async () => {
      try {
        await clearAllFields(createdEvent.id);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdEvent) return;
    setWizardError(null);
    try {
      await editEvent({
        id: createdEvent.id,
        payload: { status: "ACTIVE" },
      });
      setCreatedEvent(prev => prev ? { ...prev, status: "ACTIVE" } : null);
      setWizardStep(3);
    } catch (err: any) {
      setWizardError(err.message || "An unexpected error occurred.");
    }
  };

  // Generate QR Code once the event is created
  useEffect(() => {
    if (wizardStep === 3 && createdEvent && user) {
      const generateQr = async () => {
        try {
          const shareUrl = `${window.location.origin}/e/${user.organizationSlug}/${createdEvent.slug}`;
          const dataUrl = await QRCode.toDataURL(shareUrl, {
            width: 1024,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });
          setQrUrl(dataUrl);
        } catch (err) {
          console.error("Failed to generate high-resolution QR code:", err);
        }
      };
      generateQr();
    }
  }, [wizardStep, createdEvent, user]);

  return (
    <div className={`mx-auto bg-bg-panel/30 border border-border-main/60 rounded-3xl p-8 shadow-xl animate-fadeIn transition-all duration-300 ${wizardStep === 2 && showPreview ? "max-w-5xl" : "max-w-2xl"}`}>
      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-main/60">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
            wizardStep >= 1 ? "bg-accent-primary text-white shadow-sm" : "bg-bg-panel-alt text-text-muted border border-border-main"
          }`}>
            1
          </div>
          <span className={`text-xs font-bold transition-all ${wizardStep >= 1 ? "text-text-primary" : "text-text-secondary"}`}>
            Basic Info
          </span>
        </div>
        <div className="flex-1 h-0.5 bg-border-main/60 mx-4"></div>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
            wizardStep >= 2 ? "bg-accent-primary text-white shadow-sm" : "bg-bg-panel-alt text-text-muted border border-border-main"
          }`}>
            2
          </div>
          <span className={`text-xs font-bold transition-all ${wizardStep >= 2 ? "text-text-primary" : "text-text-secondary"}`}>
            Form Fields
          </span>
        </div>
        <div className="flex-1 h-0.5 bg-border-main/60 mx-4"></div>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
            wizardStep >= 3 ? "bg-accent-primary text-white shadow-sm" : "bg-bg-panel-alt text-text-muted border border-border-main"
          }`}>
            3
          </div>
          <span className={`text-xs font-bold transition-all ${wizardStep >= 3 ? "text-text-primary" : "text-text-secondary"}`}>
            Embed Widget
          </span>
        </div>
      </div>

      {/* STEP 1: Basic Info */}
      {wizardStep === 1 && (
        <form onSubmit={handleCreateDraftEvent} className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-text-primary font-display">Event Details</h3>
            <p className="text-text-secondary text-xs font-medium">
              Provide the name, description, date, and hosting coordinates for this event.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-text-primary">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Event Title *
              </label>
              <input
                type="text"
                required
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder-text-secondary/45 focus:outline-none focus:border-accent-primary"
                placeholder="e.g. Esports Winter Championship"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Description *
              </label>
              <textarea
                required
                rows={3}
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder-text-secondary/45 focus:outline-none focus:border-accent-primary resize-vertical"
                placeholder="Brief summary detailing the goals, perks, and scheduled outline..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-accent-primary"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Location / Platform *
              </label>
              <input
                type="text"
                required
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder-text-secondary/45 focus:outline-none focus:border-accent-primary"
                placeholder="e.g. Auditorium A / Discord Server"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Seat Reservation Limit (optional)
              </label>
              <input
                type="number"
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder-text-secondary/45 focus:outline-none focus:border-accent-primary"
                placeholder="e.g. 100"
                value={maxRegistrations}
                onChange={(e) => setMaxRegistrations(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Event Poster Image
              </label>
              <div className="flex gap-3">
                <label className="flex-1 flex items-center justify-center border border-dashed border-border-main hover:border-accent-primary rounded-xl py-3 px-4 cursor-pointer text-xs font-bold text-accent-primary transition bg-bg-panel-alt select-none">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePosterUpload}
                  />
                  {uploadingPoster ? "Uploading..." : posterFile ? "Change Image" : "Choose File"}
                </label>
              </div>
              {posterUrl && (
                <div className="mt-2 text-[10px] text-emerald-400 font-bold block overflow-hidden truncate max-w-full">
                  Uploaded: {posterUrl}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Cover Image Size Override (Aspect Ratio)
              </label>
              <select
                value={wizardAutoFitImage}
                onChange={(e) => setWizardAutoFitImage(e.target.value)}
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
              >
                <option value="inherit">Inherit Global Setting (default)</option>
                <option value="true">Force Auto-Fit (Preserve aspect ratio)</option>
                <option value="false">Force Cropped Cover (Standard height constraint)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Registration Close Option
              </label>
              <select
                value={deadlineType}
                onChange={(e) => setDeadlineType(e.target.value as any)}
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
              >
                <option value="start">At Event Start</option>
                <option value="1h">1 Hour before event</option>
                <option value="6h">6 Hours before event</option>
                <option value="24h">24 Hours before event</option>
                <option value="custom">Custom Date & Time</option>
              </select>
            </div>

            {deadlineType === "custom" ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                  Custom Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-accent-primary"
                  value={customDeadline}
                  onChange={(e) => setCustomDeadline(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 opacity-50">
                  Calculated Deadline Preview
                </label>
                <div className="w-full bg-bg-panel-alt border border-border-main/50 rounded-xl py-3 px-4 text-xs font-semibold text-text-secondary opacity-60">
                  {date ? (
                    (() => {
                      const eventTime = new Date(date).getTime();
                      let dDate: Date;
                      if (deadlineType === "start") dDate = new Date(eventTime);
                      else if (deadlineType === "1h") dDate = new Date(eventTime - 60 * 60 * 1000);
                      else if (deadlineType === "6h") dDate = new Date(eventTime - 6 * 60 * 60 * 1000);
                      else dDate = new Date(eventTime - 24 * 60 * 60 * 1000);
                      return dDate.toLocaleString();
                    })()
                  ) : (
                    "Please set event date to see preview"
                  )}
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="flex items-center justify-between p-4 rounded-xl bg-bg-panel-alt border border-border-main hover:bg-bg-panel-hover transition cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-text-primary block">Feature this Event</span>
                  <span className="text-[10px] text-text-secondary block">
                    Display prominently at the top of your standalone hub directory. Maximum 3 active featured events.
                  </span>
                  {events.filter((e) => e.isFeatured && e.status === "ACTIVE").length >= 3 && (
                    <span className="text-[9px] text-amber-500 font-semibold block mt-1">
                      ⚠️ Limit reached (3/3 active featured). To activate this event as featured, you will need to unfeature another active event first.
                    </span>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary border-border-main bg-bg-panel-alt cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-accent-primary hover:bg-accent-hover text-white font-extrabold py-3 px-8 rounded-xl text-sm shadow-md transition-all cursor-pointer"
            >
              Next: Choose Form Layout
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Form Fields Customization */}
      {wizardStep === 2 && createdEvent && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-border-main/40 pb-4 mb-4">
            <div>
              <h3 className="text-xl font-extrabold text-text-primary font-display">Customize Registration Form</h3>
              <p className="text-text-secondary text-xs font-medium">
                Add, edit, or reorder the fields attendees will fill out to register.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview((prev) => !prev)}
              className="px-3 py-1 bg-bg-panel-alt hover:bg-bg-panel-hover border border-border-main text-text-secondary hover:text-text-primary rounded-lg text-xs font-bold transition cursor-pointer btn-interactive select-none"
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          </div>

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

          <div className={`grid grid-cols-1 ${showPreview ? "lg:grid-cols-12" : ""} gap-6 animate-fadeIn`}>
            {/* Left Column: Form Fields List & Editor */}
            <div className={showPreview ? "lg:col-span-7 space-y-6" : "w-full space-y-6"}>
              
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
                    Active Form Fields ({editingFields.length} / 20)
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
                    No fields defined yet. Add some fields or apply a preset template.
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
                          {/* Animated drop zone */}
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
                                </div>
                                <div className="text-xs text-text-secondary truncate mt-0.5">
                                  {field.placeholder && `Placeholder: "${field.placeholder}"`}
                                  {field.placeholder && opts.length > 0 && " • "}
                                  {opts.length > 0 && `Choices: ${opts.join(", ")}`}
                                  {!field.placeholder && opts.length === 0 && <span className="opacity-45">No placeholder</span>}
                                </div>
                              </div>

                              {/* Reordering & Controls */}
                              {!isDragged && (
                                <div className="flex items-center gap-2 shrink-0 opacity-60 lg:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
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

                    {/* Trailing drop zone */}
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
                
                <div
                  className="mx-auto w-full border border-border-main bg-bg-panel-alt text-text-primary shadow-lg rounded-2xl p-6 transition-all duration-300 max-w-[340px]"
                  style={{ minHeight: "420px" }}
                >
                  <div className="mb-6">
                    <h4 className="text-base font-extrabold text-text-primary truncate">
                      {createdEvent.title}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1 truncate">
                      {createdEvent.location}
                    </p>
                  </div>
                  
                  <div className="max-h-[380px] overflow-y-auto pr-0.5 scrollbar-thin">
                    <RegistrationForm
                      event={{
                        id: createdEvent.id,
                        title: createdEvent.title,
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

          {wizardError && (
            <div className="text-red-400 text-xs font-semibold bg-red-955 bg-red-950/40 border border-red-900/50 p-3 rounded-lg">
              {wizardError}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-border-main/60">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="text-text-secondary hover:text-text-primary text-sm font-bold transition cursor-pointer"
            >
              Back to details
            </button>
            <button
              type="button"
              onClick={handleCreateEventSubmit}
              disabled={isEditing}
              className="bg-accent-primary hover:bg-accent-hover text-white font-extrabold py-3 px-8 rounded-xl text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? "Publishing Event..." : "Publish & Generate Widget"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Embed Code Integration */}
      {wizardStep === 3 && createdEvent && (
        <div className="space-y-6">
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-500 font-extrabold text-2xl animate-pulse">
              ✓
            </div>
            <h3 className="text-xl font-extrabold text-text-primary font-display">Event Created Successfully!</h3>
            <p className="text-text-secondary text-xs mt-1 font-medium">
              Your event slug <span className="font-mono text-accent-primary font-semibold">{createdEvent.slug}</span> is registered.
            </p>
          </div>

          {/* 1. Standalone Direct Link */}
          <div className="space-y-2">
            <label className="block text-text-secondary text-[10px] font-black uppercase tracking-wider">
              Standalone Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-bg-panel border border-border-main rounded-xl px-4 py-2.5 text-xs text-accent-primary font-mono select-all truncate">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/e/${user?.organizationSlug}/${createdEvent.slug}`
                  : `http://localhost:3000/e/${user?.organizationSlug}/${createdEvent.slug}`}
              </div>
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}/e/${user?.organizationSlug}/${createdEvent.slug}`;
                  navigator.clipboard.writeText(shareUrl);
                  showToast("Standalone event link copied to clipboard!", "success");
                }}
                className="bg-accent-primary hover:bg-accent-hover text-white font-extrabold text-xs px-4 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer btn-interactive"
              >
                Copy
              </button>
            </div>
          </div>

          {/* 2. QR Code block */}
          <div className="p-5 rounded-2xl bg-bg-panel border border-border-main shadow-sm flex flex-col sm:flex-row items-center gap-5">
            {qrUrl ? (
              <div className="p-2 rounded-xl bg-white border border-border-main/40 flex items-center justify-center shadow-inner flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="Event QR Code" className="w-[100px] h-[100px] object-contain" />
              </div>
            ) : (
              <div className="w-[100px] h-[100px] rounded-xl bg-bg-panel-alt border border-border-main flex items-center justify-center text-[10px] text-text-secondary animate-pulse flex-shrink-0">
                Generating QR...
              </div>
            )}
            <div className="space-y-1.5 flex-1 text-center sm:text-left">
              <h4 className="text-xs font-black text-text-primary font-display">Printable Event QR Code</h4>
              <p className="text-[10px] text-text-secondary leading-relaxed font-medium">
                Deploy your QR code on posters or fliers. Generates at 1024px density for professional physical banner prints.
              </p>
              {qrUrl && (
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.download = `${createdEvent.slug}-qr.png`;
                    link.href = qrUrl;
                    link.click();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary/10 border border-accent-primary/20 hover:bg-accent-primary/20 text-accent-primary font-bold text-[10px] uppercase transition cursor-pointer"
                >
                  ⬇ Download Print PNG
                </button>
              )}
            </div>
          </div>

          {/* 3. HTML Embed Script */}
          <div className="space-y-2 border-t border-border-main/60 pt-4">
            <label className="block text-text-secondary text-[10px] font-black uppercase tracking-wider">
              HTML Embed Snippet
            </label>
            <p className="text-[10px] text-text-secondary leading-normal font-medium">
              Copy and paste the custom script tag and web component element into your hosting site markup!
            </p>
            <div className="bg-bg-panel border border-border-main rounded-xl p-3.5 font-mono text-[10px] text-text-primary overflow-x-auto select-all max-h-28 shadow-sm">
              <pre className="whitespace-pre"><code className="text-text-muted">{`<!-- EventsPlug Embed Script -->\n`}</code><code className="text-accent-primary">{`<script type="module" src="http://localhost:5173/src/main.ts"></script>\n\n`}</code><code className="text-text-muted">{`<!-- EventsPlug Element -->\n`}</code><code className="text-accent-primary">{`<event-widget org="${user?.organizationSlug}"></event-widget>`}</code></pre>
            </div>
            <button
              onClick={() => {
                const snippet = `<!-- EventsPlug Embed Script -->\n<script type="module" src="http://localhost:5173/src/main.ts"></script>\n\n<!-- EventsPlug Element -->\n<event-widget org="${user?.organizationSlug}"></event-widget>`;
                navigator.clipboard.writeText(snippet);
                showToast("Embed snippet copied to clipboard!", "success");
              }}
              className="w-full bg-bg-panel hover:bg-bg-panel-hover text-text-primary border border-border-main font-bold py-2 rounded-xl text-xs transition cursor-pointer btn-interactive"
            >
              Copy Snippet
            </button>
          </div>

          <div className="flex justify-center pt-4 border-t border-border-main/60">
            <button
              type="button"
              onClick={onBackToOverview}
              className="bg-accent-primary hover:bg-accent-hover text-white font-bold py-3 px-8 rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer btn-interactive"
            >
              Back to Dashboard Overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
