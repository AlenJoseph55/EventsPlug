/// <reference path="./custom-elements.d.ts" />
import React, { useEffect, useState } from 'react';

export interface EventsWidgetProps {
  org: string;
  scriptUrl?: string;
  loadingElement?: React.ReactNode;
}

export function EventsWidget({
  org,
  scriptUrl = 'http://localhost:5173/src/main.ts', // Default local development URL
  loadingElement
}: EventsWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Inject custom widget script in the DOM if not already present
    const existingScript = document.getElementById('eventsplug-widget-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'eventsplug-widget-script';
      script.type = 'module';
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }
  }, [scriptUrl]);

  // Safely avoid server-side rendering mismatches on Next.js
  if (!mounted) {
    return (
      loadingElement || (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#888', fontFamily: 'sans-serif', fontSize: '13px' }}>
          Initializing registration interface...
        </div>
      )
    );
  }

  return (
    <div className="eventsplug-widget-container" style={{ width: '100%' }}>
      <event-widget org={org}></event-widget>
    </div>
  );
}
