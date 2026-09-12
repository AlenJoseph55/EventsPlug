"use client";

import React, { useState } from "react";

interface FormField {
  id: string;
  label: string;
  type: "TEXT" | "EMAIL" | "SELECT" | "CHECKBOX" | "NUMBER" | "TEXTAREA";
  required: boolean;
  placeholder?: string | null;
  options?: any;
  order: number;
}

interface RegistrationFormProps {
  event: {
    id: string;
    title: string;
    formFields?: FormField[];
    registrationButtonLabel?: string | null;
    formDensity?: "COMPACT" | "COMFORTABLE";
  };
  preview?: boolean;
  onSubmitSuccess?: (registration: any) => void;
  primaryColor?: string;
  cardBg?: string;
  textColor?: string;
}

export default function RegistrationForm({
  event,
  preview = false,
  onSubmitSuccess,
  primaryColor = "var(--accent-primary)",
  cardBg = "#111827",
  textColor = "#f3f4f6",
}: RegistrationFormProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback to standard fields if none are defined
  const fields: FormField[] = event.formFields && event.formFields.length > 0
    ? event.formFields
    : [
        {
          id: "default-name",
          label: "Full Name",
          type: "TEXT",
          required: true,
          placeholder: "John Doe",
          order: 1,
        },
        {
          id: "default-email",
          label: "Email Address",
          type: "EMAIL",
          required: true,
          placeholder: "john@example.com",
          order: 2,
        },
      ];

  const handleInputChange = (fieldId: string, value: any) => {
    if (preview) return;
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) return;

    setLoading(true);
    setError(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      const res = await fetch(`${apiBase}/events/${event.id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to register. Please double-check your answers.");
      }

      onSubmitSuccess?.(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const primaryStyles = {
    backgroundColor: primaryColor,
    color: "#ffffff",
  };

  const isColorDark = (color?: string): boolean => {
    if (!color) return true;

    // Resolve CSS variable if possible
    let resolvedColor = color;
    if (color.startsWith("var(") && typeof window !== "undefined") {
      const varName = color.slice(4, -1).trim();
      resolvedColor =
        window.getComputedStyle(document.documentElement).getPropertyValue(varName).trim() ||
        window.getComputedStyle(document.body).getPropertyValue(varName).trim() ||
        color;
    }

    if (resolvedColor.startsWith("var(")) {
      if (typeof window !== "undefined") {
        if (document.documentElement.classList.contains("light-admin")) return false;
      }
      if (
        textColor &&
        (textColor.includes("16%") ||
          textColor === "#111827" ||
          textColor === "#1f2937" ||
          textColor === "#1a1f2e")
      ) {
        return false;
      }
      return true;
    }

    // Try canvas-based parsing for any valid CSS color
    if (typeof window !== "undefined") {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = resolvedColor;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;

          // If the background is mostly transparent (alpha < 0.2), we check the textColor's brightness
          if (a < 51) {
            if (textColor) {
              const isTextDark = isColorDark(textColor);
              return !isTextDark;
            }
            return true;
          }
          // Perceived luminance formula
          return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
        }
      } catch (e) {
        // Fall back to hex parsing below
      }
    }

    if (resolvedColor.startsWith("#")) {
      const hex = resolvedColor.replace("#", "");
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
      } else if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
      }
    }
    return true;
  };

  const isBgDark = isColorDark(cardBg);
  const isCompact = event.formDensity === "COMPACT";

  const inputStyles = {
    backgroundColor: isBgDark ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 0, 0.03)",
    borderColor: isBgDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.15)",
    color: textColor,
    opacity: 0.9,
    WebkitTextFillColor: textColor,
  } as React.CSSProperties;

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${isCompact ? "space-y-3" : "space-y-4"} ${preview ? "pointer-events-none select-none" : ""}`}
    >
      {error && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 text-xs font-semibold leading-relaxed">
          ⚠️ {error}
        </div>
      )}

      <div className={isCompact ? "space-y-3" : "space-y-4"}>
        {fields.map((field) => {
          const isCheckbox = field.type === "CHECKBOX";

          return (
            <div key={field.id} className={`${isCheckbox ? "flex items-start gap-2.5 py-1" : "space-y-1.5"}`}>
              {!isCheckbox && (
                <label 
                  style={{ color: textColor }}
                  className="block text-xs font-bold uppercase tracking-wide opacity-90 select-none"
                >
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
              )}

              {field.type === "TEXT" && (
                <input
                  type="text"
                  required={field.required}
                  readOnly={preview}
                  tabIndex={preview ? -1 : undefined}
                  placeholder={field.placeholder || ""}
                  value={answers[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  style={inputStyles}
                  className={`w-full border rounded-xl px-4 ${isCompact ? "py-2" : "py-2.5"} text-sm placeholder:text-current placeholder:opacity-40 focus:outline-none focus:border-slate-700 transition-colors`}
                />
              )}

              {field.type === "EMAIL" && (
                <input
                  type="email"
                  required={field.required}
                  readOnly={preview}
                  tabIndex={preview ? -1 : undefined}
                  placeholder={field.placeholder || "email@example.com"}
                  value={answers[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  style={inputStyles}
                  className={`w-full border rounded-xl px-4 ${isCompact ? "py-2" : "py-2.5"} text-sm placeholder:text-current placeholder:opacity-40 focus:outline-none focus:border-slate-700 transition-colors`}
                />
              )}

              {field.type === "NUMBER" && (
                <input
                  type="number"
                  required={field.required}
                  readOnly={preview}
                  tabIndex={preview ? -1 : undefined}
                  placeholder={field.placeholder || ""}
                  value={answers[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  style={inputStyles}
                  className={`w-full border rounded-xl px-4 ${isCompact ? "py-2" : "py-2.5"} text-sm placeholder:text-current placeholder:opacity-40 focus:outline-none focus:border-slate-700 transition-colors`}
                />
              )}

              {field.type === "TEXTAREA" && (
                <textarea
                  required={field.required}
                  readOnly={preview}
                  tabIndex={preview ? -1 : undefined}
                  rows={3}
                  placeholder={field.placeholder || ""}
                  value={answers[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  style={inputStyles}
                  className={`w-full border rounded-xl px-4 ${isCompact ? "py-2" : "py-2.5"} text-sm placeholder:text-current placeholder:opacity-40 focus:outline-none focus:border-slate-700 transition-colors resize-none`}
                />
              )}

              {field.type === "SELECT" && (() => {
                let resolvedOptions: string[] = [];
                if (field.options) {
                  if (typeof field.options === "string") {
                    try {
                      resolvedOptions = JSON.parse(field.options);
                    } catch {
                      resolvedOptions = (field.options as string).split(",").map(o => o.trim()).filter(Boolean);
                    }
                  } else if (Array.isArray(field.options)) {
                    resolvedOptions = field.options;
                  }
                }
                return (
                  <select
                    required={field.required}
                    tabIndex={preview ? -1 : undefined}
                    value={answers[field.id] || ""}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    style={inputStyles}
                    className={`w-full border rounded-xl px-4 ${isCompact ? "py-2" : "py-2.5"} text-sm focus:outline-none focus:border-slate-700 transition-colors appearance-none cursor-pointer`}
                  >
                    <option 
                      value="" 
                      disabled 
                      style={{ backgroundColor: cardBg, color: isBgDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
                    >
                      {field.placeholder || "Select an option..."}
                    </option>
                    {resolvedOptions.map((opt) => (
                      <option 
                        key={opt} 
                        value={opt} 
                        style={{ backgroundColor: cardBg, color: textColor }}
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                );
              })()}

              {isCheckbox && (
                <>
                  <input
                    type="checkbox"
                    id={field.id}
                    required={field.required}
                    tabIndex={preview ? -1 : undefined}
                    checked={!!answers[field.id]}
                    onChange={(e) => handleInputChange(field.id, e.target.checked)}
                    style={{
                      borderColor: isBgDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                      backgroundColor: isBgDark ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 0, 0.03)",
                    }}
                    className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary focus:outline-none cursor-pointer mt-0.5"
                  />
                  <label 
                    htmlFor={field.id} 
                    style={{ color: textColor }}
                    className="text-xs opacity-80 select-none cursor-pointer leading-tight"
                  >
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        style={primaryStyles}
        disabled={preview || loading}
        className={`w-full text-sm font-extrabold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-[0.98] select-none text-center ${
          preview ? "cursor-default opacity-90" : "cursor-pointer hover:opacity-95"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin text-sm">🌀</span> Registering...
          </span>
        ) : (
          event.registrationButtonLabel || "Register now"
        )}
      </button>
    </form>
  );
}
