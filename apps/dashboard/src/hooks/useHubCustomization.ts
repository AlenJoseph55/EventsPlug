"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

export interface HubCustomizationData {
  hubTitle: string;
  hubDescription: string;
  hubLogoUrl?: string | null;
  hubIcon: string;
  showCardDate: boolean;
  showCardLocation: boolean;
  showCardCapacity: boolean;
  hubLayout: "GRID" | "LIST" | "CAROUSEL";
  hubThemeId?: string | null;
  hubAccentColor?: string | null;
  hubBgColor?: string | null;
  hubBannerUrl?: string | null;
  hubThemeStyle: string;
  autoFitImages: boolean;
}

export function useHubCustomization() {
  const { token, apiBase } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Get Customization query
  const customizationQuery = useQuery<HubCustomizationData>({
    queryKey: ["customization"],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/organizations/customization`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch customization settings.");
      }
      const data = await res.json();
      return {
        hubTitle: data.hubTitle || "",
        hubDescription: data.hubDescription || "",
        hubLogoUrl: data.hubLogoUrl || "",
        hubIcon: data.hubIcon || "🏫",
        showCardDate: data.showCardDate !== false,
        showCardLocation: data.showCardLocation !== false,
        showCardCapacity: data.showCardCapacity !== false,
        hubLayout: data.hubLayout || "GRID",
        hubThemeId: data.hubThemeId || "",
        hubAccentColor: data.hubAccentColor || "#6366f1",
        hubBgColor: data.hubBgColor || "#090d16",
        hubBannerUrl: data.hubBannerUrl || "",
        hubThemeStyle: data.hubThemeStyle || "DOT_MATRIX",
        autoFitImages: data.autoFitImages !== false,
      };
    },
    enabled: !!token,
  });

  // Save customization mutation
  const saveCustomizationMutation = useMutation({
    mutationFn: async (payload: Partial<HubCustomizationData>) => {
      const res = await fetch(`${apiBase}/organizations/customization`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update customization.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customization"] });
      showToast("Hub customization settings saved successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error saving customization settings", "error");
    },
  });

  // Image upload mutation helper (reused for logo/banner/poster)
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${apiBase}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to upload image.");
      }

      const data = await res.json();
      return data.url as string;
    },
  });

  return {
    customization: customizationQuery.data,
    isLoading: customizationQuery.isLoading,
    isError: customizationQuery.isError,
    
    // Actions
    saveCustomization: saveCustomizationMutation.mutateAsync,
    isSaving: saveCustomizationMutation.isPending,
    
    uploadImage: uploadImageMutation.mutateAsync,
    isUploading: uploadImageMutation.isPending,
  };
}
