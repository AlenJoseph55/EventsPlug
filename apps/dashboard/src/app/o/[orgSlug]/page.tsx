import React from "react";
import { notFound } from "next/navigation";
import { fetchPublicOrgEvents } from "@/lib/public-api";
import PublicHubClient from "./PublicHubClient";

export const dynamic = "force-dynamic";

interface OrgPageProps {
  params: Promise<{
    orgSlug: string;
  }>;
}

export async function generateMetadata({ params }: OrgPageProps) {
  const resolvedParams = await params;
  try {
    const data = await fetchPublicOrgEvents(resolvedParams.orgSlug);

    if (!data || "isSuspended" in data) {
      return { title: "Organization Unavailable - EventsPlug" };
    }

    return {
      title: `${data.organization.name} Hub | EventsPlug`,
      description: `View and register for upcoming events hosted by ${data.organization.name}`,
    };
  } catch {
    return { title: "EventsPlug Organization Hub" };
  }
}

export default async function PublicOrgPage({ params }: OrgPageProps) {
  const resolvedParams = await params;
  const data = await fetchPublicOrgEvents(resolvedParams.orgSlug);

  // If the organization doesn't exist, trigger 404
  if (!data) {
    notFound();
  }

  // Graceful handle of suspended organizations
  if ("isSuspended" in data && data.isSuspended) {
    return (
      <main className="min-h-screen bg-[#06080f] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="z-10 text-center max-w-md w-full space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-3xl shadow-lg">
            ⚠️
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black tracking-tight text-white uppercase">Hub Temporarily Unavailable</h1>
            <p className="text-slate-400 text-xs leading-relaxed font-semibold">
              This organization directory has been suspended or is undergoing maintenance. Access to listings is temporarily restricted.
            </p>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-white/5 pt-4">
            If you believe this is an error, please contact the EventsPlug support team.
          </div>
        </div>
      </main>
    );
  }

  const { organization, events } = data as any;

  return (
    <PublicHubClient organization={organization} events={events} />
  );
}
