const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export interface PublicOrgData {
  status?: "SUSPENDED" | "ACTIVE";
  organization: {
    id: string;
    name: string;
    slug: string;
    status: string;
    defaultLayout: "GRID" | "LIST" | "CAROUSEL";
    defaultLimit: number | null;
    defaultTheme: any;
    hubLayout: "GRID" | "LIST" | "CAROUSEL";
    hubTheme: any;
    hubTitle: string;
    hubDescription: string;
    hubLogoUrl: string | null;
    hubIcon: string;
    showCardDate: boolean;
    showCardLocation: boolean;
    showCardCapacity: boolean;
    hubAccentColor: string | null;
    hubBgColor: string | null;
    hubBannerUrl: string | null;
    hubThemeStyle: string;
    autoFitImages: boolean;
  };
  events: any[];
}

/**
 * Fetches a single public event's details + dinamically loaded custom form fields
 * Uses edge-cached ISR with 60s revalidation
 */
export async function fetchPublicEvent(orgSlug: string, eventSlug: string) {
  try {
    const res = await fetch(`${API_BASE}/organizations/${orgSlug}/events/${eventSlug}`, {
      next: { revalidate: 0 },
    });

    if (res.status === 403) {
      return { isSuspended: true };
    }

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching public event ${orgSlug}/${eventSlug}:`, error);
    return null;
  }
}

/**
 * Fetches the entire public event list for an organization
 * Uses edge-cached ISR with 60s revalidation
 */
export async function fetchPublicOrgEvents(orgSlug: string): Promise<PublicOrgData | { isSuspended: true } | null> {
  try {
    const res = await fetch(`${API_BASE}/organizations/${orgSlug}/events`, {
      next: { revalidate: 0 },
    });

    if (res.status === 403) {
      return { isSuspended: true };
    }

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching public organization events for ${orgSlug}:`, error);
    return null;
  }
}
