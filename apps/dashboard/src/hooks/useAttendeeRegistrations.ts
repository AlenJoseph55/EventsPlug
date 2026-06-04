"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";

export interface AttendeeRegistration {
  id: string;
  eventId: string;
  answers: Record<string, unknown>;
  createdAt: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventSlug: string;
  eventPosterUrl?: string | null;
  orgSlug: string;
  orgName: string;
}

export function useAttendeeRegistrations() {
  const { token, apiBase, viewMode } = useAuth();

  const attendeeRegistrationsQuery = useQuery<AttendeeRegistration[]>({
    queryKey: ["attendee-registrations"],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/registrations/my-registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch attendee registrations.");
      }
      return res.json();
    },
    enabled: !!token && viewMode === "attendee",
  });

  return {
    registrations: attendeeRegistrationsQuery.data || [],
    isLoading: attendeeRegistrationsQuery.isLoading,
    isError: attendeeRegistrationsQuery.isError,
    refetchRegistrations: attendeeRegistrationsQuery.refetch,
  };
}
