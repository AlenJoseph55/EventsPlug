"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { useEvents, EventData } from "@/hooks/useEvents";

interface CreateEventTabProps {
  onBackToOverview: () => void;
}

export default function CreateEventTab({ onBackToOverview }: CreateEventTabProps) {
  const { token, apiBase, user } = useAuth();
  const { showToast } = useToast();
  const { createEvent, isCreating } = useEvents();

  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [maxRegistrations, setMaxRegistrations] = useState("");
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

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWizardError(null);

    const payload = {
      title,
      description,
      date: new Date(date).toISOString(),
      location,
      posterUrl: posterUrl || undefined,
      maxRegistrations: maxRegistrations ? parseInt(maxRegistrations, 10) : undefined,
      templatePreset: formTemplateId,
      autoFitImage: wizardAutoFitImage === "inherit" ? null : wizardAutoFitImage === "true",
    };

    try {
      const eventData = await createEvent(payload);
      setCreatedEvent(eventData);
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
    <div className="max-w-2xl mx-auto bg-bg-panel/30 border border-border-main/60 rounded-3xl p-8 shadow-xl animate-fadeIn">
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
        <form onSubmit={(e) => { e.preventDefault(); setWizardStep(2); }} className="space-y-6">
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

      {/* STEP 2: Choose Template & Save */}
      {wizardStep === 2 && (
        <form onSubmit={handleCreateEventSubmit} className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-text-primary font-display">Choose Registration Form Template</h3>
            <p className="text-text-secondary text-xs font-medium">
              Select one of our predefined forms designed to capture the exact details for this category.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 max-h-[360px] overflow-y-auto pr-2">
            {[
              {
                id: "INDIVIDUAL",
                name: "Individual Event",
                desc: "Standard form capturing Name, Email, Phone, and optional Institution details.",
                fields: "name, email, phone, institution",
              },
              {
                id: "TEAM",
                name: "Team Event",
                desc: "Captures Team Name, Leader details, Team Size, and other Member profiles.",
                fields: "teamName, leaderName, leaderEmail, teamSize, members",
              },
              {
                id: "GAMING_TOURNAMENT",
                name: "Gaming Tournament",
                desc: "Gathers In-Game Alias (IGN), Discord contact handle, and Preferred Platform.",
                fields: "ign, email, discord, platform (PC/Console/Mobile)",
              },
              {
                id: "WORKSHOP",
                name: "Educational Workshop",
                desc: "Asks experience levels (Beginner/Intermediate/Advanced) and expectations motivation.",
                fields: "name, email, experience, motivation",
              },
              {
                id: "HACKATHON",
                name: "Tech Hackathon Application",
                desc: "Captures technical portfolio links, GitHub credentials, stack skills, and T-shirt sizes.",
                fields: "name, email, github, portfolio, tshirt, skills",
              },
            ].map((tpl) => (
              <label
                key={tpl.id}
                onClick={() => setFormTemplateId(tpl.id)}
                className={`flex gap-4 p-4 border rounded-2xl cursor-pointer transition ${
                  formTemplateId === tpl.id
                    ? "bg-accent-primary/10 border-accent-primary shadow-md shadow-accent-primary/5"
                    : "bg-bg-panel-alt border-border-main hover:border-slate-700/80"
                }`}
              >
                <input
                  type="radio"
                  name="formTemplate"
                  className="mt-1 accent-accent-primary"
                  checked={formTemplateId === tpl.id}
                  onChange={() => {}}
                />
                <div>
                  <div className="font-bold text-sm text-text-primary">{tpl.name}</div>
                  <p className="text-text-secondary text-xs mt-1 leading-relaxed font-medium">{tpl.desc}</p>
                  <div className="mt-2 text-[10px] text-text-secondary font-mono">
                    Fields: {tpl.fields}
                  </div>
                </div>
              </label>
            ))}
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
              type="submit"
              disabled={isCreating}
              className="bg-accent-primary hover:bg-accent-hover text-white font-extrabold py-3 px-8 rounded-xl text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Publishing Event..." : "Publish & Generate Widget"}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Embed Code Integration */}
      {wizardStep === 3 && createdEvent && (
        <div className="space-y-6">
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/30 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4 text-emerald-400 font-extrabold text-2xl animate-bounce">
              ✓
            </div>
            <h3 className="text-xl font-extrabold text-text-primary font-display">Event Created Successfully!</h3>
            <p className="text-text-secondary text-xs mt-1 font-medium">
              Your event slug <span className="font-mono text-accent-primary font-bold">{createdEvent.slug}</span> is registered.
            </p>
          </div>

          {/* 1. Standalone Direct Link */}
          <div className="space-y-2">
            <label className="block text-text-secondary text-[10px] font-black uppercase tracking-wider">
              Standalone Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-accent-primary font-mono select-all truncate">
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
                className="bg-accent-primary hover:bg-accent-hover text-white font-extrabold text-xs px-4 rounded-xl shadow-lg transition cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>

          {/* 2. QR Code block */}
          <div className="p-4 rounded-2xl bg-slate-950/20 border border-border-main/55 flex flex-col sm:flex-row items-center gap-5">
            {qrUrl ? (
              <div className="p-2 rounded-xl bg-white flex items-center justify-center shadow-inner flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl} alt="Event QR Code" className="w-[100px] h-[100px] object-contain" />
              </div>
            ) : (
              <div className="w-[100px] h-[100px] rounded-xl bg-slate-900 border border-border-main flex items-center justify-center text-[10px] text-text-secondary animate-pulse flex-shrink-0">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary/20 border border-accent-primary/30 hover:bg-accent-primary/30 text-accent-primary font-extrabold text-[10px] uppercase transition-colors cursor-pointer"
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
            <div className="bg-[#0b0f19] border border-border-main rounded-xl p-3 font-mono text-[10px] text-accent-primary overflow-x-auto select-all max-h-24">
              <pre className="whitespace-pre">{`<!-- EventsPlug Embed Script -->
<script type="module" src="http://localhost:5173/src/main.ts"></script>

<!-- EventsPlug Element -->
<event-widget org="${user?.organizationSlug}"></event-widget>`}</pre>
            </div>
            <button
              onClick={() => {
                const snippet = `<!-- EventsPlug Embed Script -->\n<script type="module" src="http://localhost:5173/src/main.ts"></script>\n\n<!-- EventsPlug Element -->\n<event-widget org="${user?.organizationSlug}"></event-widget>`;
                navigator.clipboard.writeText(snippet);
                showToast("Embed snippet copied to clipboard!", "success");
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
            >
              Copy Snippet
            </button>
          </div>

          <div className="flex justify-center pt-4 border-t border-border-main/60">
            <button
              type="button"
              onClick={onBackToOverview}
              className="bg-accent-primary hover:bg-accent-hover text-white font-bold py-3 px-8 rounded-xl text-sm shadow-md transition-all cursor-pointer"
            >
              Back to Dashboard Overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
