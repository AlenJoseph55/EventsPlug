"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

interface WebhookEndpointItem {
  id: string;
  name: string | null;
  url: string;
  lastFailedAt: string | null;
  createdAt: string;
}

export default function WebhooksTab() {
  const { token, apiBase } = useAuth();
  const [endpoints, setEndpoints] = useState<WebhookEndpointItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEndpoints = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/webhooks/endpoints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load webhook endpoints");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchEndpoints();
  }, [token]);

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/webhooks/endpoints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: url.trim(),
          name: name.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create webhook endpoint");
      }

      const data = await res.json();
      setCreatedSecret(data.signingSecret);
      setUrl("");
      setName("");
      fetchEndpoints();
    } catch (err: any) {
      setError(err.message || "Failed to create webhook endpoint");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook endpoint? No more events will be delivered to this URL.")) {
      return;
    }

    try {
      const res = await fetch(`${apiBase}/webhooks/endpoints/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchEndpoints();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete endpoint");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-text-primary font-display flex items-center gap-2">
          <span>🔔</span> Webhook Endpoints
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Receive real-time HTTP POST notifications when events occur in your organization (registration created, registration cancelled, event published, event closed).
        </p>
      </div>

      {/* Secret Display Banner */}
      {createdSecret && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Webhook Signing Secret Generated
          </div>
          <p className="text-xs text-text-secondary">
            Save this signing secret now. It will <strong className="text-text-primary">never be shown again</strong>. Use this secret to verify signatures in the <code className="font-mono bg-bg-panel-alt px-1 py-0.5 rounded text-text-primary">X-EventsPlug-Signature</code> header.
          </p>
          <div className="flex items-center gap-2 bg-bg-panel-alt border border-border-main rounded-xl p-2.5">
            <input
              type="text"
              readOnly
              value={createdSecret}
              className="bg-transparent text-xs font-mono text-text-primary flex-1 outline-none select-all"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(createdSecret)}
              className="px-3 py-1.5 rounded-lg bg-text-primary text-bg-app text-xs font-semibold hover:opacity-90 transition cursor-pointer"
            >
              {copied ? "Copied!" : "Copy Secret"}
            </button>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCreatedSecret(null)}
              className="text-xs text-text-secondary hover:text-text-primary underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create Endpoint Form */}
      <div className="bg-bg-panel border border-border-main rounded-2xl p-5">
        <h4 className="text-sm font-bold text-text-primary mb-3">Add New Webhook Endpoint</h4>
        <form onSubmit={handleCreateEndpoint} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Endpoint URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://api.yourdomain.com/webhooks"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-text-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Description / Name (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Production Zapier Sync"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-text-primary transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium">{error}</p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isCreating || !url.trim()}
              className="px-4 py-2 rounded-xl bg-text-primary text-bg-app text-xs font-bold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isCreating ? "Adding Endpoint..." : "Add Endpoint"}
            </button>
          </div>
        </form>
      </div>

      {/* Endpoints List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-text-primary">Configured Endpoints</h4>
        {isLoading ? (
          <div className="text-center py-8 text-xs text-text-muted">Loading endpoints...</div>
        ) : endpoints.length === 0 ? (
          <div className="text-center py-10 bg-bg-panel/40 border border-dashed border-border-main rounded-2xl">
            <p className="text-xs text-text-muted">No webhook endpoints configured yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {endpoints.map((ep) => {
              const createdDate = new Date(ep.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={ep.id}
                  className="bg-bg-panel border border-border-main rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary truncate font-mono">
                        {ep.url}
                      </span>
                      {ep.lastFailedAt ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          Delivery issues
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                      {ep.name && <span>{ep.name}</span>}
                      {ep.name && <span>•</span>}
                      <span>Created {createdDate}</span>
                      {ep.lastFailedAt && (
                        <>
                          <span>•</span>
                          <span className="text-rose-400">
                            Last failed: {new Date(ep.lastFailedAt).toLocaleTimeString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(ep.id)}
                      className="px-3 py-1.5 rounded-lg border border-border-main hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-500 text-xs font-semibold transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
