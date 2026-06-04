import React from "react";
import { notFound } from "next/navigation";
import { fetchPublicEvent } from "@/lib/public-api";
import EventPageClient from "./EventPageClient";

interface PageProps {
  params: Promise<{
    orgSlug: string;
    eventSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  try {
    const data = await fetchPublicEvent(resolvedParams.orgSlug, resolvedParams.eventSlug);
    
    if (!data || data.isSuspended) {
      return { title: "Event Not Found - EventsPlug" };
    }

    return {
      title: `${data.title} | EventsPlug`,
      description: data.description || `Register for ${data.title} on EventsPlug`,
      openGraph: {
        title: data.title,
        description: data.description || "Register for this event",
        images: data.posterUrl ? [{ url: data.posterUrl }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: data.title,
        description: data.description || "Register for this event",
        images: data.posterUrl ? [data.posterUrl] : [],
      },
    };
  } catch {
    return { title: "EventsPlug" };
  }
}

export default async function PublicEventPage({ params }: PageProps) {
  const resolvedParams = await params;
  const event = await fetchPublicEvent(resolvedParams.orgSlug, resolvedParams.eventSlug);

  // If the event does not exist, trigger standard Next.js 404 catcher
  if (!event) {
    notFound();
  }

  // Graceful handle of suspended organizations
  if (event.isSuspended) {
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
              The organization managing this event registration has been suspended or is undergoing review. Access is temporarily restricted.
            </p>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-white/5 pt-4">
            If you believe this is an error, please contact the EventsPlug support team.
          </div>
        </div>
      </main>
    );
  }

  return <EventPageClient event={event} />;
}
