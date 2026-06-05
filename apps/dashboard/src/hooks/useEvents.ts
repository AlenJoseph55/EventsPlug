"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

export interface CustomField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options: string[] | string;
  order: number;
}

export interface EventData {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  location: string;
  posterUrl?: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  maxRegistrations?: number;
  templatePreset?: string;
  autoFitImage?: boolean | null;
  formTemplateId?: string;
  themeId?: string | null;
  // Backend returns 'formFields' (Prisma name); 'customFields' kept for legacy compatibility
  formFields?: CustomField[];
  customFields?: CustomField[];
  _count?: {
    registrations: number;
  };
}

export function useEvents() {
  const { token, apiBase } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // 1. Get Events list query
  const eventsQuery = useQuery<EventData[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch events.");
      }
      return res.json();
    },
    enabled: !!token,
  });

  // 2. Create Event mutation
  const createEventMutation = useMutation({
    mutationFn: async (payload: Omit<EventData, "id" | "status" | "customFields" | "slug">) => {
      const res = await fetch(`${apiBase}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create event.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showToast("Event created successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error creating event", "error");
    },
  });

  // 3. Edit Event mutation
  const editEventMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<EventData> }) => {
      const res = await fetch(`${apiBase}/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save edits.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showToast("Event details updated successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error saving event details", "error");
    },
  });

  // 4. Delete Event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${apiBase}/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete event.");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showToast("Event deleted successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error deleting event", "error");
    },
  });

  // 5. Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: "ACTIVE" | "INACTIVE" | "DRAFT" }) => {
      const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const res = await fetch(`${apiBase}/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to toggle status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showToast("Event status updated!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error updating event status", "error");
    },
  });

  // 6. Fields CRUD mutations
  const addFieldMutation = useMutation({
    mutationFn: async ({ eventId, payload }: { eventId: string; payload: Omit<CustomField, "id" | "order"> }) => {
      const res = await fetch(`${apiBase}/events/${eventId}/fields`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add field.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showToast("Field added successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error adding field", "error");
    },
  });

  const deleteFieldMutation = useMutation({
    mutationFn: async ({ eventId, fieldId }: { eventId: string; fieldId: string }) => {
      const res = await fetch(`${apiBase}/events/${eventId}/fields/${fieldId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete field.");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showToast("Field deleted successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error deleting field", "error");
    },
  });

  const reorderFieldsMutation = useMutation({
    mutationFn: async ({ eventId, payload }: { eventId: string; payload: { id: string; order: number }[] }) => {
      const res = await fetch(`${apiBase}/events/${eventId}/fields/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to sync reordered fields.");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: any) => {
      showToast(err.message || "Error reordering fields", "error");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const applyPresetFieldsMutation = useMutation({
    mutationFn: async ({ eventId, presetId, mode }: { eventId: string; presetId: string; mode: "APPEND" | "REPLACE" }) => {
      const res = await fetch(`${apiBase}/events/${eventId}/fields/preset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preset: presetId, mode }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to apply preset fields.");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showToast(
        `Preset fields successfully ${variables.mode === "REPLACE" ? "applied (replaced)" : "appended"}!`,
        "success"
      );
    },
    onError: (err: any) => {
      showToast(err.message || "Error applying preset fields", "error");
    },
  });

  const clearAllFieldsMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`${apiBase}/events/${eventId}/fields/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to clear fields.");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showToast("All custom fields cleared successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error clearing fields", "error");
    },
  });

  const saveFieldMutation = useMutation({
    mutationFn: async ({
      eventId,
      fieldId,
      payload,
    }: {
      eventId: string;
      fieldId: string;
      payload: Omit<CustomField, "id" | "order">;
    }) => {
      const res = await fetch(`${apiBase}/events/${eventId}/fields/${fieldId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update field.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showToast("Field updated successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error updating field", "error");
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    refetchEvents: eventsQuery.refetch,
    
    // Mutations
    createEvent: createEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
    
    editEvent: editEventMutation.mutateAsync,
    isEditing: editEventMutation.isPending,
    
    deleteEvent: deleteEventMutation.mutateAsync,
    isDeleting: deleteEventMutation.isPending,
    
    toggleEventStatus: toggleStatusMutation.mutateAsync,
    
    // Field operations mutations
    addField: addFieldMutation.mutateAsync,
    deleteField: deleteFieldMutation.mutateAsync,
    reorderFields: reorderFieldsMutation.mutateAsync,
    applyPresetFields: applyPresetFieldsMutation.mutateAsync,
    clearAllFields: clearAllFieldsMutation.mutateAsync,
    saveField: saveFieldMutation.mutateAsync,
  };
}
