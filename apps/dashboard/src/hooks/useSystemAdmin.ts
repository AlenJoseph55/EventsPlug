"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  _count?: {
    events: number;
    users: number;
  };
}

export interface PlatformMetrics {
  totalTenants: number;
  totalEvents: number;
  totalRegistrations: number;
  activeUsers: number;
}

export interface ImpersonateEvent {
  id: string;
  title: string;
  formTemplateId: string;
  status: string;
  date: string;
  location: string;
  _count?: {
    registrations: number;
  };
}

export interface ImpersonateRegistration {
  id: string;
  event?: {
    title: string;
  };
  answers: Record<string, unknown>;
  createdAt: string;
}

export function useSystemAdmin(impersonateTenantId?: string) {
  const { token, apiBase, user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  // 1. Get Platform Aggregate Metrics query
  const metricsQuery = useQuery<PlatformMetrics>({
    queryKey: ["system", "metrics"],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to load platform metrics.");
      }
      return res.json();
    },
    enabled: !!token && isSuperAdmin,
  });

  // 2. Get tenants query
  const tenantsQuery = useQuery<Tenant[]>({
    queryKey: ["system", "tenants"],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/admin/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to load tenants.");
      }
      return res.json();
    },
    enabled: !!token && isSuperAdmin,
  });

  // 3. Impersonate Events query
  const impersonateEventsQuery = useQuery<ImpersonateEvent[]>({
    queryKey: ["impersonate", "events", impersonateTenantId],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/admin/tenants/${impersonateTenantId}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to load impersonated events.");
      }
      return res.json();
    },
    enabled: !!token && isSuperAdmin && !!impersonateTenantId,
  });

  // 4. Impersonate Registrations query
  const impersonateRegistrationsQuery = useQuery<ImpersonateRegistration[]>({
    queryKey: ["impersonate", "registrations", impersonateTenantId],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/admin/tenants/${impersonateTenantId}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to load impersonated registrations.");
      }
      return res.json();
    },
    enabled: !!token && isSuperAdmin && !!impersonateTenantId,
  });

  // 5. Create Tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (payload: { name: string; slug: string; logoUrl?: string }) => {
      const res = await fetch(`${apiBase}/admin/tenants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to provision tenant.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system"] });
      showToast("Tenant organization provisioned successfully!", "success");
    },
    onError: (err: Error) => {
      showToast(err.message || "Error provisioning tenant", "error");
    },
  });

  // 6. Toggle Tenant status mutation
  const toggleTenantStatusMutation = useMutation({
    mutationFn: async ({ tenantId, currentStatus }: { tenantId: string; currentStatus: "ACTIVE" | "SUSPENDED" }) => {
      const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      const res = await fetch(`${apiBase}/admin/tenants/${tenantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update tenant status.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system"] });
      showToast("Tenant status toggled successfully!", "success");
    },
    onError: (err: Error) => {
      showToast(err.message || "Error updating tenant status", "error");
    },
  });

  return {
    metrics: metricsQuery.data,
    isLoadingMetrics: metricsQuery.isLoading,
    
    tenants: tenantsQuery.data || [],
    isLoadingTenants: tenantsQuery.isLoading,
    
    impersonateEvents: impersonateEventsQuery.data || [],
    isLoadingImpersonateEvents: impersonateEventsQuery.isLoading,
    
    impersonateRegistrations: impersonateRegistrationsQuery.data || [],
    isLoadingImpersonateRegistrations: impersonateRegistrationsQuery.isLoading,

    // Actions
    createTenant: createTenantMutation.mutateAsync,
    isCreatingTenant: createTenantMutation.isPending,
    
    toggleTenantStatus: toggleTenantStatusMutation.mutateAsync,
    isTogglingTenant: toggleTenantStatusMutation.isPending,
  };
}
