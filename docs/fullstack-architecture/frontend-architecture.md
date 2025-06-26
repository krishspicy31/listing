# Frontend Architecture

### Component Architecture

To ensure our component structure is organized and scalable, we will follow a feature-based directory structure.

**Component Organization:**

```
src/
├── app/                  # Next.js App Router (contains all routes)
├── components/
│   ├── ui/             # Reusable, base components from shadcn/ui (e.g., Button, Card)
│   └── shared/         # Application-wide components (e.g., PageLayout, Header, Footer)
└── features/
    ├── event-discovery/
    │   └── components/ # Components specific to Browse/filtering events
    │       ├── EventCard.tsx
    │       ├── EventGrid.tsx
    │       └── EventFilters.tsx
    └── vendor-dashboard/
        └── components/ # Components specific to the vendor dashboard
            ├── EventStatusBadge.tsx
            └── SubmissionForm.tsx
```

**Component Template:**
All new components should follow this standard functional component template with TypeScript.

```typescript
import React from 'react';

interface MyComponentProps {
  // Define component props here
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div>
      <h1>{title}</h1>
      {/* Component JSX */}
    </div>
  );
};

export default MyComponent;
```

### State Management Architecture

We will use a combination of strategies for state management to match the complexity of the data.

  * **Local UI State:** For state that is local to a single component (e.g., form input values, modal visibility), we will use standard React hooks like `useState` and `useReducer`.
  * **Global UI State:** For state that needs to be shared across the application (e.g., the authenticated user's profile), we will use React's built-in **Context API**. We will create specific contexts for specific domains, such as an `AuthContext`.
  * **Server State & Data Fetching:** To handle data fetched from our backend API, it is strongly recommended to use a dedicated library like **Vercel's SWR** or **TanStack Query**. These libraries expertly handle caching, re-fetching, loading states, and error states out of the box, which will significantly simplify our data-fetching logic and improve user experience.

### Routing Architecture

We will use the **Next.js App Router**, which is standard for version 14. Routes are defined by folders within the `src/app` directory.

**Route Organization:**

```
src/app/
├── page.tsx               # Homepage (/)
├── events/
│   └── [city]/            # Dynamic route for city listings (/events/chennai)
│       └── page.tsx
├── login/                 # Login page
│   └── page.tsx
├── register/              # Registration page
│   └── page.tsx
└── dashboard/
    ├── layout.tsx         # Protected layout to secure all dashboard routes
    ├── page.tsx           # Main vendor dashboard view (shows event list)
    └── submit/
        └── page.tsx       # The "Submit New Event" form
```

**Protected Route Pattern:**
The `/dashboard` segment will be protected. Its `layout.tsx` file will contain logic to check for a valid authentication token. If the user is not authenticated, they will be redirected to the `/login` page.

### Frontend Services Layer

To keep our components clean, all communication with the backend API will be encapsulated in a dedicated services layer.

**API Client Setup:**
We will create a single, centralized API client instance (using `axios` or a wrapper around `fetch`). This client will be configured to automatically attach the JWT Bearer token to the headers of all outgoing requests, simplifying authenticated calls.

**Service Example (`src/features/event-discovery/services/eventService.ts`):**

```typescript
import { apiClient } from '@/lib/apiClient';
import { Event } from '@/types'; // Assuming a shared types directory

export const getApprovedEvents = async (city?: string): Promise<Event[]> => {
  const response = await apiClient.get('/events/', {
    params: { city },
  });
  return response.data;
};

// Other event-related API functions would go here
```

