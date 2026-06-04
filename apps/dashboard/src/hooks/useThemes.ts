"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

export interface Theme {
  id: string;
  name: string;
  slug: string;
  cssVariables: Record<string, string>;
  isPremium: boolean;
  price: number;
}

export function useThemes() {
  const { token, apiBase, user, setUser } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Get Themes list query
  const themesQuery = useQuery<Theme[]>({
    queryKey: ["themes"],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/themes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to load themes.");
      }
      return res.json();
    },
    enabled: !!token,
  });

  // Set Organization Brand Preference default theme mutation
  const setOrgDefaultThemeMutation = useMutation({
    mutationFn: async (themeId: string | null) => {
      const res = await fetch(`${apiBase}/organizations/default-theme`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ themeId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update default theme.");
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate query to refresh defaultThemeId
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      
      // Update local storage user representations
      if (user && setUser) {
        const updatedUser = {
          ...user,
          defaultThemeId: data.defaultTheme?.id || null,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      showToast(
        "Organization Brand Preferences updated successfully! Embed widgets now inherit this theme automatically.",
        "success"
      );
    },
    onError: (err: any) => {
      showToast(err.message || "Error setting default theme", "error");
    },
  });

  // Set Specific Event theme override mutation
  const setEventThemeOverrideMutation = useMutation({
    mutationFn: async ({ eventId, themeId }: { eventId: string; themeId: string | null }) => {
      const res = await fetch(`${apiBase}/events/${eventId}/theme`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ themeId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to set event override theme.");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      showToast("Event theme override updated successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error updating event override theme", "error");
    },
  });

  // Buy/Unlock Premium theme checkout mutation
  const purchaseThemeMutation = useMutation({
    mutationFn: async ({
      themeId,
      cardHolder,
      cardNumber,
      cardExpiry,
      cardCVC,
    }: {
      themeId: string;
      cardHolder: string;
      cardNumber: string;
      cardExpiry: string;
      cardCVC: string;
    }) => {
      const res = await fetch(`${apiBase}/themes/${themeId}/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cardHolder, cardNumber, cardExpiry, cardCVC }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to complete transaction.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
      showToast("Theme unlocked and ready to use!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error processing payment", "error");
    },
  });

  // Update layout and card limit preferences mutation
  const updateOrgPreferencesMutation = useMutation({
    mutationFn: async ({ layout, limit }: { layout: string; limit: number | null }) => {
      const res = await fetch(`${apiBase}/organizations/preferences`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ layout, limit }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update organizational preferences.");
      }

      return res.json();
    },
    onSuccess: (data) => {
      if (user && setUser) {
        const updatedUser = {
          ...user,
          defaultLayout: data.preferences.defaultLayout,
          defaultLimit: data.preferences.defaultLimit,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      showToast("Organization layout and card limit preferences updated successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error updating layout preferences", "error");
    },
  });

  return {
    themes: themesQuery.data || [],
    isLoadingThemes: themesQuery.isLoading,
    isErrorThemes: themesQuery.isError,
    
    // Actions
    setOrgDefaultTheme: setOrgDefaultThemeMutation.mutateAsync,
    setEventThemeOverride: setEventThemeOverrideMutation.mutateAsync,
    purchaseTheme: purchaseThemeMutation.mutateAsync,
    isPurchasing: purchaseThemeMutation.isPending,
    updateOrgPreferences: updateOrgPreferencesMutation.mutateAsync,
  };
}
