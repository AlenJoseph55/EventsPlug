## Architecture Overview

The refactored dashboard portal uses a layered approach to separate responsibilities:

```
┌────────────────────────────────────────────────────────┐
│                      VIEW LAYER                        │
│        (Next.js App Router: portal/page.tsx)           │
└──────────────────────────┬─────────────────────────────┘
                           │ Renders
                           ▼
┌────────────────────────────────────────────────────────┐
│                   COMPONENTS LAYER                     │
│         (Tab Views, Form Modals & Shell Layouts)       │
└──────────────────────────┬─────────────────────────────┘
                           │ Consumes
                           ▼
┌────────────────────────────────────────────────────────┐
│                  CUSTOM HOOKS LAYER                    │
│      (useEvents, useRegistrations, useMembers)         │
└──────────────────────────┬─────────────────────────────┘
                           │ Queries / Mutations
                           ▼
┌────────────────────────────────────────────────────────┐
│                STATE & CACHE MANAGER                   │
│           (TanStack Query Cache Layer)                 │
└────────────────────────────────────────────────────────┘
```

---

## 1. Design System & Semantic Color Tokens (Tailwind v4)

We replace hardcoded colors like `bg-slate-950` or `text-slate-200` with **semantic variables** defined in `apps/dashboard/src/app/globals.css`.

### globals.css Configuration
```css
@import "tailwindcss";

:root {
  /* Default Dark Admin Palette */
  --bg-app: #090d16;
  --bg-panel: #0d1321;
  --bg-panel-hover: #161f36;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border-main: rgba(255, 255, 255, 0.08);
  --accent-color: #6366f1;
}

.light-admin {
  /* Dynamic Light Admin Overrides */
  --bg-app: #f8fafc;
  --bg-panel: #ffffff;
  --bg-panel-hover: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --border-main: rgba(15, 23, 42, 0.08);
  --accent-color: #4f46e5;
}

@theme inline {
  --color-bg-app: var(--bg-app);
  --color-bg-panel: var(--bg-panel);
  --color-bg-panel-hover: var(--bg-panel-hover);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-border-main: var(--border-main);
  --color-accent: var(--accent-color);
}
```

---

## 2. Server State Management (TanStack Query)

All async API fetch commands are handled by TanStack Query. The root provider is initialized in a layout wrapper:

### Query Client Config (`apps/dashboard/src/providers/QueryProvider.tsx`)
```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute stale time default
            refetchOnWindowFocus: false, // Prevent aggressive re-fetches
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### Query Keys Schema
* `['events']`: Lists all events matching the active user organization.
* `['registrations', eventId]`: Attendees registered for a specific event.
* `['members']`: Team members list.
* `['customization']`: Organization page style parameters.
* `['system', 'metrics']`: Super-admin aggregate statistics.
* `['system', 'tenants']`: Super-admin tenant profiles.

---

## 3. Logical Hooks Extraction

We decouple backend queries and UI triggers. For instance, the event list and edit features will use a customized hook `useEvents`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useEvents(token: string | null) {
  const queryClient = useQueryClient();

  // 1. Fetch Query
  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: () => fetchEventsFromApi(token),
    enabled: !!token,
  });

  // 2. Mutation (Create)
  const createEventMutation = useMutation({
    mutationFn: (data: any) => createEventApi(data, token),
    onSuccess: () => {
      // Invalidate events cache to trigger automatic background update
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  // 3. Mutation (Delete)
  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => deleteEventApi(eventId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    createEvent: createEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
  };
}
```

---

## 4. Directory Reconstruction Plan

```
apps/dashboard/src/
├── app/
│   ├── layout.tsx                 # Includes QueryProvider wrapper
│   └── portal/
│       └── page.tsx               # Shell Orchestrator
├── providers/
│   └── QueryProvider.tsx          # TanStack Query Client Wrapper
├── hooks/
│   ├── useEvents.ts               # Event CRUD hooks
│   ├── useRegistrations.ts        # Registrations search hook
│   ├── useHubCustomization.ts     # Cover banner / theme update hook
│   └── useTeamMembers.ts          # Member invitation hook
├── components/
│   ├── portal/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx        # Navigation sidebar with permission gates
│   │   │   └── Header.tsx         # Profile status, dark/light switch
│   │   ├── tabs/
│   │   │   ├── OverviewTab.tsx    # Summary widgets & cards
│   │   │   ├── RegistrationsTab.ts# Attendee grids
│   │   │   ├── CustomizationTab.ts# Styling controls
│   │   │   ├── MembersTab.tsx     # Org user list
│   │   │   └── SystemAdminTab.tsx # Impersonation panels
│   │   └── modals/
│   │       ├── EditEventModal.tsx # Details & dynamic custom fields
│   │       ├── ShareEventModal.tsx# High-resolution QR generator code
│   │       └── DeleteEventModal.tsx# Confirmation validator
│   └── ui/
│       └── Toast.tsx              # Dynamic global alert popup
```

---

## 5. Phased Refactoring Implementation Checklist

```markdown
- [ ] Phase 1: Setup & CSS Refactoring
  - [ ] Install `@tanstack/react-query` in dashboard package
  - [ ] Add `QueryProvider.tsx` and wrap app `layout.tsx`
  - [ ] Rewrite `globals.css` with semantic CSS variables and Tailwind v4 theme configs
  - [ ] Convert `portal/page.tsx` base visual elements to use new semantic variables
  - [ ] Verify Light Mode switch dynamically swaps CSS values without styling gaps
- [ ] Phase 2: Core Hooks Extraction
  - [ ] Create `useEvents.ts` and migrate event fetching, editing, and deletion logic
  - [ ] Create `useRegistrations.ts` and migrate attendee querying & filtering
  - [ ] Create `useHubCustomization.ts` and migrate upload forms & style settings
  - [ ] Create `useTeamMembers.ts` and migrate team invites
- [ ] Phase 3: Modular Layout & Tabs Deconstruction
  - [ ] Extract `Sidebar.tsx` and `Header.tsx` layout components
  - [ ] Move `OverviewTab` layout to `/components/portal/tabs/`
  - [ ] Move `RegistrationsTab` layout to `/components/portal/tabs/`
  - [ ] Move `CustomizationTab` layout to `/components/portal/tabs/`
  - [ ] Move `MembersTab` layout to `/components/portal/tabs/`
- [ ] Phase 4: Overlay Modals Extraction
  - [ ] Extract `EditEventModal.tsx` containing custom fields builder logic
  - [ ] Extract `ShareEventModal.tsx` containing QR Code generator logic
  - [ ] Extract `DeleteEventModal.tsx` containing title validation confirmation logic
  - [ ] Clean up orchestrator entrypoint file `portal/page.tsx`
```
