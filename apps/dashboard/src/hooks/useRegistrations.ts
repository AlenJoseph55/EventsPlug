"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

export interface Registration {
  id: string;
  eventId: string;
  email: string;
  name: string;
  createdAt: string;
  answers?: any; // Dynamic field answers
}

export function useRegistrations(eventId?: string) {
  const { token, apiBase } = useAuth();
  const { showToast } = useToast();

  // Fetch registrations query
  const registrationsQuery = useQuery<Registration[]>({
    queryKey: ["registrations", eventId],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/events/${eventId}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch registrations.");
      }
      return res.json();
    },
    enabled: !!token && !!eventId,
  });

  // Export registrations as CSV
  const exportCsv = async (targetEventId: string, eventTitle?: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${apiBase}/events/${targetEventId}/registrations/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to export CSV");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrations-${eventTitle || targetEventId}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast("CSV exported successfully!", "success");
    } catch (err: any) {
      showToast("Error exporting registrations: " + err.message, "error");
    }
  };

  return {
    registrations: registrationsQuery.data || [],
    isLoading: registrationsQuery.isLoading,
    isError: registrationsQuery.isError,
    refetchRegistrations: registrationsQuery.refetch,
    exportCsv,
  };
}
