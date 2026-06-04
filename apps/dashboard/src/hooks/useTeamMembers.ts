"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

export interface TeamMember {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MEMBER";
  createdAt: string;
}

export function useTeamMembers() {
  const { token, apiBase } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Get Team Members query
  const membersQuery = useQuery<TeamMember[]>({
    queryKey: ["members"],
    queryFn: async () => {
      const res = await fetch(`${apiBase}/organizations/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to load team members.");
      }
      return res.json();
    },
    enabled: !!token,
  });

  // Invite/Add Member mutation
  const addMemberMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      role,
    }: {
      email: string;
      password: string;
      role: "ADMIN" | "MEMBER";
    }) => {
      const res = await fetch(`${apiBase}/organizations/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          passwordPlain: password,
          role,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to add member.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      showToast("Team member added successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error adding team member", "error");
    },
  });

  // Delete/Remove Member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`${apiBase}/organizations/users/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to remove member.");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      showToast("Team member removed successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Error removing team member", "error");
    },
  });

  return {
    members: membersQuery.data || [],
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError,
    refetchMembers: membersQuery.refetch,
    
    // Actions
    addMember: addMemberMutation.mutateAsync,
    isAdding: addMemberMutation.isPending,
    
    deleteMember: deleteMemberMutation.mutateAsync,
    isDeleting: deleteMemberMutation.isPending,
  };
}
