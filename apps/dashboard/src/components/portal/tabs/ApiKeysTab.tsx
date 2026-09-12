"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
}

export default function ApiKeysTab() {
  const { token, apiBase } = useAuth();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyName, setKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api-keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchKeys();
  }, [token]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: keyName.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create API key");
      }

      const data = await res.json();
      setCreatedSecret(data.rawKey);
      setKeyName("");
      fetchKeys();
    } catch (err: any) {
      setError(err.message || "Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Applications using it will immediately lose access.")) {
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchKeys();
      }
    } catch (err: any) {
      alert(err.message || "Failed to revoke key");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-panel/40 border border-border-main/50 p-6 rounded-2xl">
        <div>
          <h3 className="text-xl font-black text-text-primary font-display flex items-center gap-2">
            <span>🔑</span> Developer API Keys
          </h3>
          <p className="text-xs text-text-secondary font-medium mt-1">
            Generate org-scoped API keys to authenticate REST API requests via the <code className="text-accent-primary font-mono bg-bg-panel px-1 py-0.5 rounded">X-API-Key</code> header.
          </p>
        </div>
      </div>

      {/* Secret Reveal Modal / Card */}
      {createdSecret && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <span>✓</span> New API Key Created Successfully
          </div>
          <p className="text-xs text-text-secondary">
            Copy this key now. For security reasons, <strong>you will never be able to see it again</strong>.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={createdSecret}
              className="w-full bg-bg-app border border-emerald-500/40 rounded-xl px-4 py-2.5 font-mono text-xs text-emerald-300 select-all"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(createdSecret)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex-shrink-0"
            >
              {copied ? "Copied!" : "Copy Key"}
            </button>
            <button
              type="button"
              onClick={() => setCreatedSecret(null)}
              className="px-3 py-2.5 bg-bg-panel hover:bg-bg-panel-alt border border-border-main text-text-secondary hover:text-text-primary text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Create Key Form */}
      <form onSubmit={handleCreateKey} className="bg-bg-panel/40 border border-border-main/50 p-6 rounded-2xl flex flex-col sm:flex-row items-end gap-4">
        <div className="w-full">
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Create New Key
          </label>
          <input
            type="text"
            required
            placeholder="Key name (e.g. Production Backend, Zapier Integration)"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="w-full bg-bg-panel-alt border border-border-main rounded-xl py-2.5 px-4 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-primary text-xs font-semibold"
          />
        </div>
        <button
          type="submit"
          disabled={isCreating || !keyName.trim()}
          className="w-full sm:w-auto px-6 py-2.5 bg-accent-primary hover:bg-accent-hover text-white font-extrabold text-xs tracking-wider rounded-xl transition shadow-md shadow-accent-primary/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          {isCreating ? "Generating..." : "Generate Key"}
        </button>
      </form>

      {error && (
        <div className="text-rose-500 text-xs font-semibold p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          {error}
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-bg-panel/40 border border-border-main/50 rounded-2xl p-6">
        {isLoading ? (
          <div className="text-center py-12 text-text-secondary font-display">
            <span className="animate-spin text-lg mr-2 inline-block">🌀</span>
            Loading API keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12 text-text-secondary border border-dashed border-border-main rounded-xl text-xs">
            No API keys found. Generate a key to begin using the REST API.
          </div>
        ) : (
          <div className="overflow-x-auto bg-bg-panel/20 border border-border-main/30 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main/60 text-text-secondary text-xs font-semibold uppercase bg-bg-panel/40">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Key Prefix</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Last Used</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => {
                  const isRevoked = !!key.revokedAt;
                  const dateStr = new Date(key.createdAt).toLocaleDateString();
                  const lastUsedStr = key.lastUsedAt
                    ? new Date(key.lastUsedAt).toLocaleDateString()
                    : "Never";

                  return (
                    <tr key={key.id} className="border-b border-border-main/20 hover:bg-bg-panel/30 text-xs">
                      <td className="py-4 px-4 font-bold text-text-primary">
                        {key.name}
                      </td>
                      <td className="py-4 px-4 font-mono text-accent-primary">
                        {key.keyPrefix}...
                      </td>
                      <td className="py-4 px-4 text-text-secondary">
                        {dateStr}
                      </td>
                      <td className="py-4 px-4 text-text-secondary">
                        {lastUsedStr}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isRevoked
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {isRevoked ? "Revoked" : "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {!isRevoked && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(key.id)}
                            className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer text-xs"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
