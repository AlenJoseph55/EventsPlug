"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useSystemAdmin, Tenant, ImpersonateRegistration } from "@/hooks/useSystemAdmin";
import { useThemes } from "@/hooks/useThemes";

export default function SystemAdminTab() {
  const { systemTab } = useAuth();
  const { themes } = useThemes();

  // State to hold active impersonating tenant
  const [impersonatingTenant, setImpersonatingTenant] = useState<Tenant | null>(null);

  const {
    metrics,
    isLoadingMetrics,
    tenants,
    isLoadingTenants,
    impersonateEvents,
    isLoadingImpersonateEvents,
    impersonateRegistrations,
    isLoadingImpersonateRegistrations,
    createTenant,
    isCreatingTenant,
    toggleTenantStatus,
  } = useSystemAdmin(impersonatingTenant?.id);

  // Tenant Creator States
  const [creatingTenant, setCreatingTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantSlug, setNewTenantSlug] = useState("");
  const [newTenantLogo, setNewTenantLogo] = useState("");
  const [tenantError, setTenantError] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTenantError(null);
    try {
      await createTenant({
        name: newTenantName,
        slug: newTenantSlug,
        logoUrl: newTenantLogo || undefined,
      });
      // Reset on success
      setCreatingTenant(false);
      setNewTenantName("");
      setNewTenantSlug("");
      setNewTenantLogo("");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to provision tenant.";
      setTenantError(errMsg);
    }
  };

  const handleToggleStatus = async (tenantId: string, currentStatus: "ACTIVE" | "SUSPENDED") => {
    try {
      await toggleTenantStatus({ tenantId, currentStatus });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Platform Analytics Summary Metrics */}
      {!isLoadingMetrics && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-border-main/40">
          <div className="space-y-1">
            <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider block">
              Global Organizations
            </span>
            <span className="text-2xl font-black text-purple-400 font-display block">
              {metrics.totalTenants}
            </span>
            <span className="text-[10px] text-text-secondary">Provisioned tenant workspaces</span>
          </div>

          <div className="space-y-1 md:border-l md:border-border-main/30 md:pl-6">
            <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider block">
              Global Platform Events
            </span>
            <span className="text-2xl font-black text-accent-primary font-display block">
              {metrics.totalEvents}
            </span>
            <span className="text-[10px] text-text-secondary">Active host configurations</span>
          </div>

          <div className="space-y-1 md:border-l md:border-border-main/30 md:pl-6">
            <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider block">
              Global Registrations
            </span>
            <span className="text-2xl font-black text-emerald-400 font-display block">
              {metrics.totalRegistrations}
            </span>
            <span className="text-[10px] text-text-secondary">Registered tickets database</span>
          </div>

          <div className="space-y-1 md:border-l md:border-border-main/30 md:pl-6">
            <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider block">
              Active Platform Users
            </span>
            <span className="text-2xl font-black text-pink-400 font-display block">
              {metrics.activeUsers}
            </span>
            <span className="text-[10px] text-text-secondary">Associated emails in system</span>
          </div>
        </div>
      )}

      {systemTab === "tenants" ? (
        /* TENANT REGISTRY DIRECTORY PANEL */
        <div className="bg-bg-panel/40 border border-border-main/50 rounded-2xl p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold text-text-primary">
                Tenant Directory Registry
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Platform-wide active workspaces and subscription locks control panel
              </p>
            </div>
            <button
              onClick={() => {
                setTenantError(null);
                setCreatingTenant(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-650 hover:bg-purple-750 text-white font-bold text-sm shadow shadow-purple-500/10 transition-all duration-200 self-start sm:self-auto cursor-pointer"
            >
              ➕ Provision Tenant
            </button>
          </div>

          {isLoadingTenants ? (
            <div className="py-20 text-center text-text-secondary text-sm font-semibold animate-pulse">
              Retrieving global tenants records...
            </div>
          ) : tenants.length === 0 ? (
            <div className="py-20 text-center text-text-secondary text-sm border border-dashed border-border-main rounded-xl">
              No organizations provisioned yet. Click &quot;Provision Tenant&quot; above to start!
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border-main/60 bg-slate-950/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-main/80 bg-bg-panel/20 text-text-secondary text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Tenant Name</th>
                    <th className="py-4 px-6">Public Slug</th>
                    <th className="py-4 px-6">Tenant Status</th>
                    <th className="py-4 px-6">Metrics</th>
                    <th className="py-4 px-6">Provisioned</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/60 text-sm text-text-primary">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-bg-panel/30 transition-all">
                      <td className="py-4 px-6 font-bold">
                        {tenant.name}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded">
                          {tenant.slug}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            tenant.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                          }`}></span>
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            tenant.status === "ACTIVE" ? "text-emerald-400" : "text-text-secondary"
                          }`}>
                            {tenant.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-text-secondary">
                        <span className="font-bold text-text-primary">{tenant._count?.events || 0}</span> events • <span className="font-bold text-text-primary">{tenant._count?.users || 0}</span> members
                      </td>
                      <td className="py-4 px-6 text-xs text-text-secondary">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Status Switch */}
                          <button
                            onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                              tenant.status === "ACTIVE" ? "bg-emerald-600" : "bg-slate-800"
                            }`}
                            title={tenant.status === "ACTIVE" ? "Suspend Tenant" : "Activate Tenant"}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              tenant.status === "ACTIVE" ? "translate-x-6" : "translate-x-1"
                            }`} />
                          </button>

                          <button
                            onClick={() => setImpersonatingTenant(tenant)}
                            className="px-3 py-1.5 rounded-lg border border-border-main bg-bg-panel/40 hover:bg-slate-800/80 text-xs font-bold text-text-primary transition-all duration-150 cursor-pointer"
                          >
                            🔍 Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* SYSTEM WIDGET THEMES MANAGER PANEL */
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-bg-panel/40 border border-border-main/50 rounded-2xl p-6 shadow-md">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text-primary">Global Widget Themes Registry</h3>
              <p className="text-xs text-text-secondary mt-1">
                手製 (handcrafted) visual custom skins compiled across the event flows ecosystem
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-main text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">
                    <th className="py-3 px-4">Theme Info</th>
                    <th className="py-3 px-4">Semantic Intent Parameters</th>
                    <th className="py-3 px-4">Monetization status</th>
                    <th className="py-3 px-4 text-right">Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/60 text-xs text-text-primary">
                  {themes.map((theme) => (
                    <tr key={theme.id} className="hover:bg-bg-panel/20 transition-colors">
                      <td className="py-4 px-4 font-bold">
                        <div className="flex flex-col">
                          <span>{theme.name}</span>
                          <span className="text-[10px] font-mono text-purple-400 font-semibold">{theme.slug}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-[9px] leading-relaxed">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div>
                            <span className="text-text-secondary font-semibold">mode:</span>{" "}
                            <span className="font-bold text-text-primary">{theme.baseMode}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary font-semibold">accent:</span>{" "}
                            <span className="font-bold text-text-primary">H:{theme.accentHue}° / C:{theme.accentChroma}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary font-semibold">surface:</span>{" "}
                            <span className="font-bold text-text-primary">{theme.surfaceTone}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary font-semibold">skin:</span>{" "}
                            <span className="font-bold text-text-primary">{theme.skinId}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-text-secondary font-semibold">pairing:</span>{" "}
                            <span className="font-bold text-text-primary">{theme.fontPairingId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold">
                        {theme.isPremium ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/40 border border-amber-900/60 text-[10px] text-amber-300 font-bold uppercase">
                            💎 Premium (${(theme.price || 0).toFixed(2)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-900/60 text-[10px] text-emerald-300 font-bold uppercase">
                            🆓 FREE
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-[10px] font-bold text-text-secondary uppercase italic opacity-60">
                          System Default
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Provision Tenant Modal */}
      {creatingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#090d16] border border-border-main rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <div className="flex justify-between items-start pb-4 border-b border-white/5 mb-5">
              <div>
                <h4 className="text-md font-bold text-text-primary flex items-center gap-1.5">
                  ➕ Provision New Tenant Organization
                </h4>
                <p className="text-xs text-text-secondary mt-1">
                  Create a completely isolated system workspace for client deployments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreatingTenant(false)}
                className="text-text-secondary hover:text-text-primary text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  className="w-full bg-[#111827] border border-border-main rounded-lg py-2.5 px-3 text-text-primary placeholder-text-secondary/45 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. acme"
                  className="w-full bg-[#111827] border border-border-main rounded-lg py-2.5 px-3 text-text-primary placeholder-text-secondary/45 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm font-mono"
                  value={newTenantSlug}
                  onChange={(e) => setNewTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                />
                <span className="text-[10px] text-text-secondary mt-1 block">
                  Alphanumeric and hyphens only. Used for widget integration codes.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-[#111827] border border-border-main rounded-lg py-2.5 px-3 text-text-primary placeholder-text-secondary/45 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                  value={newTenantLogo}
                  onChange={(e) => setNewTenantLogo(e.target.value)}
                />
              </div>

              {tenantError && (
                <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl text-xs text-rose-400">
                  {tenantError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreatingTenant(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTenant}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-950/30 flex justify-center items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isCreatingTenant ? "Provisioning..." : "Provision Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Impersonation Drawer */}
      {impersonatingTenant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-4xl bg-[#090d16] border-l border-border-main h-full flex flex-col shadow-2xl p-8 overflow-y-auto animate-slideIn">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border-main/60">
              <div>
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                  Inspecting: {impersonatingTenant.name}
                </h3>
                <p className="text-xs text-purple-300 font-mono mt-1">
                  Tenant Slug: {impersonatingTenant.slug}
                </p>
              </div>
              <button
                onClick={() => setImpersonatingTenant(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-text-secondary hover:text-text-primary transition cursor-pointer"
              >
                ✕ Close Inspector
              </button>
            </div>

            {/* READ ONLY WARNING BANNER */}
            <div className="mb-6 p-4 bg-amber-950/20 border border-amber-900/50 rounded-2xl flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <span className="text-sm font-bold text-amber-400 block">Read-Only Security Impersonation Boundary</span>
                <span className="text-xs text-text-secondary mt-0.5 block font-medium">
                  You are inspecting this tenant&apos;s dashboard records from an administrative scope. All write, update, and deletion controllers are completely disabled in this mode.
                </span>
              </div>
            </div>

            {isLoadingImpersonateEvents || isLoadingImpersonateRegistrations ? (
              <div className="py-20 text-center text-text-secondary text-sm font-semibold animate-pulse">
                Retrieving tenant workspace data...
              </div>
            ) : (
              <div className="space-y-8 flex-1">
                {/* Events Sub-sheet */}
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-text-secondary mb-3 pl-1">
                    Events Spreadsheet ({impersonateEvents.length})
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-border-main/60 bg-slate-950/20">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border-main/80 bg-bg-panel/20 text-text-secondary font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Event Title</th>
                          <th className="py-3 px-4">Form Template</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Registrations</th>
                          <th className="py-3 px-4">Scheduled</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-main/60 text-text-primary">
                        {impersonateEvents.map((evt) => (
                          <tr key={evt.id} className="hover:bg-bg-panel/10">
                            <td className="py-3 px-4 font-bold">{evt.title}</td>
                            <td className="py-3 px-4 font-mono text-[10px] text-accent-primary">{evt.formTemplateId}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                evt.status === "ACTIVE" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50" : "bg-slate-950/40 text-slate-400 border border-slate-900/50"
                              }`}>
                                {evt.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{evt._count?.registrations || 0} registered</td>
                            <td className="py-3 px-4 text-text-secondary">{new Date(evt.date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {impersonateEvents.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-text-secondary italic">No events configured for this tenant.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Registrations Sub-sheet */}
                <div>
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-text-secondary mb-3 pl-1">
                    Attendee Spreadsheet ({impersonateRegistrations.length})
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-border-main/60 bg-slate-950/20">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border-main/80 bg-bg-panel/20 text-text-secondary font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Registration ID</th>
                          <th className="py-3 px-4">Associated Event</th>
                          <th className="py-3 px-4">Answers</th>
                          <th className="py-3 px-4">Submitted Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-main/60 text-text-primary">
                        {impersonateRegistrations.map((reg: ImpersonateRegistration) => (
                          <tr key={reg.id} className="hover:bg-bg-panel/10">
                            <td className="py-3 px-4 font-mono text-[10px] text-text-secondary">{reg.id.substring(0, 8)}...</td>
                            <td className="py-3 px-4 font-bold">{reg.event?.title}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1 text-[10px]">
                                {Object.entries(reg.answers || {}).map(([k, v]) => (
                                  <div key={k} className="flex gap-1.5">
                                    <span className="text-text-secondary font-semibold">{k}:</span>
                                    <span className="text-text-primary">{String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-text-secondary">{new Date(reg.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {impersonateRegistrations.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-text-secondary italic">No registrations submitted for this tenant.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
