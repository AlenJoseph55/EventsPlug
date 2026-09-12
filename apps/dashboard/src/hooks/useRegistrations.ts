"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

export interface Registration {
  id: string;
  eventId: string;
  email?: string;
  name?: string;
  status: "CONFIRMED" | "CANCELLED" | "REGISTERED" | "WAITLISTED" | "CHECKED_IN";
  identityValue?: string;
  identityType?: string | null;
  paymentStatus?: string;
  paymentTxnId?: string | null;
  checkedInAt?: string | null;
  cancelledAt?: string | null;
  promotedAt?: string | null;
  createdAt: string;
  answers?: any; // Dynamic field answers
}

export function useRegistrations(eventId?: string) {
  const { token, apiBase } = useAuth();
  const { showToast } = useToast();

  // Fetch registrations query
  const registrationsQuery = useQuery<{ data: Registration[]; nextCursor?: string | null } | Registration[]>({
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

  const cancelRegistration = async (registrationId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${apiBase}/registrations/${registrationId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel registration");
      }

      showToast("Registration cancelled successfully", "success");
      await registrationsQuery.refetch();
      return data;
    } catch (err: any) {
      showToast(err.message || "Error cancelling registration", "error");
      throw err;
    }
  };

  const checkInRegistration = async (targetEventId: string, registrationId: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${apiBase}/events/${targetEventId}/check-in`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Check-in failed");
      }

      showToast("Attendee successfully checked in!", "success");
      await registrationsQuery.refetch();
      return data;
    } catch (err: any) {
      showToast(err.message || "Error checking in attendee", "error");
      throw err;
    }
  };

  const rawData = registrationsQuery.data;
  const list: Registration[] = Array.isArray(rawData)
    ? rawData
    : (rawData && Array.isArray((rawData as any).data) ? (rawData as any).data : []);

  return {
    registrations: list,
    isLoading: registrationsQuery.isLoading,
    isError: registrationsQuery.isError,
    refetchRegistrations: registrationsQuery.refetch,
    exportCsv,
    cancelRegistration,
    checkInRegistration,
  };
}
