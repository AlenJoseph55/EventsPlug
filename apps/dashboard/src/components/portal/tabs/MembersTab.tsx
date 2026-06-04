"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export default function MembersTab() {
  const { user } = useAuth();
  const {
    members,
    isLoading: loadingMembers,
    addMember,
    isAdding: savingMember,
    deleteMember,
  } = useTeamMembers();

  // Local Form States
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"MEMBER" | "ADMIN">("MEMBER");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMember({
        email: newMemberEmail,
        password: newMemberPassword,
        role: newMemberRole,
      });
      // Reset form states on success
      setNewMemberEmail("");
      setNewMemberPassword("");
      setNewMemberRole("MEMBER");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header block */}
      <div className="flex justify-between items-center pb-4 border-b border-border-main/50">
        <div>
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            👥 Team Collaboration & Members
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Manage your team's access. Add members, assign roles, and revoke access as needed.
          </p>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left panel: members list table (7-span) */}
        <div className="lg:col-span-7 bg-bg-panel/40 border border-border-main/50 rounded-2xl p-6 shadow-md">
          <h4 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            👥 Active Organization Members
          </h4>
          
          {loadingMembers ? (
            <div className="text-center py-12 text-text-secondary flex flex-col items-center gap-3">
              <span className="animate-spin text-xl">🌀</span>
              <span>Loading team members...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              No team members found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-main text-text-secondary font-bold uppercase tracking-wider text-[10px] bg-bg-panel/20">
                    <th className="pb-3 pt-2 pl-4">User Email</th>
                    <th className="pb-3 pt-2">Role</th>
                    <th className="pb-3 pt-2 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main/30 text-text-primary">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-bg-panel/30 transition-all duration-150">
                      <td className="py-3.5 pl-4 pr-3 font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="truncate max-w-[200px] sm:max-w-none">{member.email}</span>
                        {member.id === user?.id && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-black uppercase">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                          member.role === "SUPER_ADMIN"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-800/35"
                            : member.role === "ADMIN"
                            ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                            : "bg-slate-500/20 text-slate-400 border border-slate-800/35"
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-4">
                        {member.id !== user?.id && member.role !== "SUPER_ADMIN" ? (
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to revoke access for this team member?")) {
                                deleteMember(member.id);
                              }
                            }}
                            className="bg-danger-bg/25 hover:bg-danger-bg/60 border border-danger-border/30 hover:border-danger-border/60 text-danger-text p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            title="Revoke access"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        ) : (
                          <span className="text-text-secondary text-[10px] italic opacity-50">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right panel: Add Team Member Form (5-span) */}
        <div className="lg:col-span-5 bg-bg-panel/40 border border-border-main/50 rounded-2xl p-6 shadow-md">
          <h4 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
            ➕ Invite/Create Team Member
          </h4>
          <p className="text-xs text-text-secondary mb-6">
            Add a new user directly to your organization. They will be able to log in with their email and chosen password immediately.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="collaborator@company.com"
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-primary transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">
                Temporary Password
              </label>
              <input
                type="password"
                required
                value={newMemberPassword}
                onChange={(e) => setNewMemberPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder-text-secondary/40 focus:outline-none focus:border-accent-primary transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">
                Role & Permissions
              </label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value as any)}
                className="w-full bg-bg-panel-alt border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary transition cursor-pointer"
              >
                <option value="MEMBER">Member (Read-only access)</option>
                <option value="ADMIN">Admin (Full brand, customization & members control)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingMember}
              className="w-full bg-accent-primary hover:bg-accent-hover text-white font-extrabold py-2.5 rounded-xl text-xs transition duration-200 shadow-md flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:cursor-not-allowed"
            >
              {savingMember ? (
                <>
                  <span className="animate-spin text-sm">🌀</span>
                  <span>Adding Member...</span>
                </>
              ) : (
                <span>Add Team Member</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
