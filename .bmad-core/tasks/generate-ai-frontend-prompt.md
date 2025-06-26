# Create AI Frontend Prompt Task

## Purpose

To generate a masterful, comprehensive, and optimized prompt that can be used with any AI-driven frontend development tool (e.g., Vercel v0, Lovable.ai, or similar) to scaffold or generate significant portions of a frontend application.

## Inputs

- Completed UI/UX Specification (`front-end-spec`)
- Completed Frontend Architecture Document (`front-end-architecture`) or a full stack combined architecture such as `architecture.md`
- Main System Architecture Document (`architecture` - for API contracts and tech stack to give further context)

## Generated AI Frontend Prompts for CulturaLite

Based on the comprehensive analysis of the PRD, fullstack architecture, and frontend specification documents, I've created multiple targeted prompts optimized for AI tools like v0, Cursor, or Lovable. Each prompt follows the structured four-part framework for maximum effectiveness.

---

### Prompt 1: Homepage with Event Discovery Grid

**High-Level Goal:** Create a responsive homepage for CulturaLite that displays cultural events in a filterable grid layout with mobile-first design and SEO optimization.

**Detailed, Step-by-Step Instructions:**
1. Create a Next.js 14 page component using TypeScript at `src/app/page.tsx`
2. Implement server-side rendering to fetch approved events from `/api/events/` endpoint
3. Build a responsive event grid using shadcn/ui Card components with 1 column on mobile, 2 on tablet, 3+ on desktop
4. Add filter dropdowns for City and Category above the grid using shadcn/ui Select components
5. Implement loading states with skeleton components while data fetches
6. Add empty state messaging when no events match filters
7. Style using Tailwind CSS with the specified color palette (Primary: #F97316, Accent: #22C55E)
8. Ensure each event card displays: image, title, date, city, and category
9. Make the entire card clickable for future event detail navigation
10. Add proper semantic HTML structure for SEO and accessibility

**Code Examples, Data Structures & Constraints:**
```typescript
// Event interface from architecture doc
interface Event {
  id: number;
  title: string;
  description: string;
  city: string;
  event_date: string; // ISO 8601 Date string
  image_url: string;
  category: {
    name: string;
    slug: string;
  };
}

// API endpoint structure
GET /api/events/?city=Chennai&category=Dance
```

Use Inter font family, implement mobile-first responsive design, and ensure WCAG 2.1 AA compliance. DO NOT create any authentication logic or vendor-specific features in this component.

**Define a Strict Scope:** Only create the homepage component and its immediate child components (EventCard, EventGrid, EventFilters). Do NOT modify any authentication, dashboard, or admin-related files.

---

### Prompt 2: Vendor Authentication System

**High-Level Goal:** Build a complete vendor authentication system with login and registration pages that integrate with Django JWT authentication.

**Detailed, Step-by-Step Instructions:**
1. Create login page at `src/app/login/page.tsx` with email/password form
2. Create registration page at `src/app/register/page.tsx` with name, email, password fields
3. Implement form validation using React Hook Form with proper error handling
4. Create an AuthContext using React Context API for global authentication state
5. Build an API service layer for authentication calls to `/api/auth/login/` and `/api/auth/register/`
6. Implement secure JWT token storage using httpOnly cookies or secure localStorage
7. Add loading states and error handling for network requests
8. Style forms using shadcn/ui Form components with consistent branding
9. Implement redirect logic: successful login redirects to `/dashboard`
10. Add "Remember me" functionality and password visibility toggle
11. Include proper form accessibility with labels, ARIA attributes, and keyboard navigation

**Code Examples, Data Structures & Constraints:**
```typescript
// Login API request/response
POST /api/auth/login/
{
  "email": "vendor@example.com",
  "password": "securepassword"
}

// Response
{
  "access": "jwt_access_token_here",
  "refresh": "jwt_refresh_token_here"
}

// AuthContext interface
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

Use shadcn/ui Button, Input, and Form components. Implement proper error states with inline validation messages. DO NOT include any event submission or dashboard functionality.

**Define a Strict Scope:** Create only authentication-related components, context, and services. Do NOT modify the homepage, dashboard, or any event-related components.

---

### Prompt 3: Vendor Dashboard with Event Management

**High-Level Goal:** Create a protected vendor dashboard that displays submitted events with their status and provides navigation to event submission.

**Detailed, Step-by-Step Instructions:**
1. Create dashboard layout at `src/app/dashboard/layout.tsx` with authentication protection
2. Build main dashboard page at `src/app/dashboard/page.tsx` showing vendor's events
3. Implement event status badges (Pending: yellow, Approved: green, Rejected: red)
4. Create a responsive table/card layout showing event title, date, city, and status
5. Add dashboard navigation with "Submit New Event" prominent call-to-action
6. Implement notifications section showing recent status changes
7. Add empty state for vendors with no submitted events
8. Include loading states while fetching vendor-specific data
9. Build logout functionality in the header
10. Ensure mobile-responsive design with collapsible navigation
11. Add breadcrumb navigation for better UX

**Code Examples, Data Structures & Constraints:**
```typescript
// Vendor events API
GET /api/dashboard/events/
Authorization: Bearer jwt_token_here

// Response structure
interface VendorEvent {
  id: number;
  title: string;
  city: string;
  event_date: string;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
}

// Notification interface
interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}
```

Use shadcn/ui Table, Badge, and Card components. Implement proper loading skeletons and error boundaries. DO NOT include the actual event submission form in this component.

**Define a Strict Scope:** Create only dashboard-related components and protected route logic. Do NOT modify authentication pages, homepage, or create the event submission form.

---

### Prompt 4: Event Submission Form with Image Upload

**High-Level Goal:** Build a comprehensive event submission form with Cloudinary image upload integration and proper validation.

**Detailed, Step-by-Step Instructions:**
1. Create event submission page at `src/app/dashboard/submit/page.tsx`
2. Build multi-step or single-page form with fields: title, description, city, event_date, category, image
3. Implement Cloudinary image upload widget with preview functionality
4. Add form validation with real-time feedback using React Hook Form
5. Create category dropdown populated from backend API
6. Implement date/time picker for event scheduling
7. Add rich text editor for event description (optional: simple textarea is acceptable)
8. Include image upload progress indicator and error handling
9. Add form auto-save functionality to prevent data loss
10. Implement success/error states with proper user feedback
11. Ensure mobile-optimized form layout with proper touch targets

**Code Examples, Data Structures & Constraints:**
```typescript
// Event submission API
POST /api/dashboard/events/
Content-Type: multipart/form-data
Authorization: Bearer jwt_token_here

// Form data structure
interface EventFormData {
  title: string;
  description: string;
  city: string;
  event_date: string;
  category_id: number;
  image: File;
}

// Cloudinary upload response
{
  "secure_url": "https://res.cloudinary.com/...",
  "public_id": "event_images/abc123"
}
```

Use shadcn/ui Form, Input, Textarea, Select, and Button components. Implement proper file upload validation (size, type). DO NOT create dashboard navigation or authentication logic.

**Define a Strict Scope:** Create only the event submission form and related components. Do NOT modify dashboard layout, authentication, or homepage components.

---

### Prompt 5: Mobile-Responsive Navigation and Layout System

**High-Level Goal:** Create a unified navigation and layout system that adapts seamlessly across mobile, tablet, and desktop devices.

**Detailed, Step-by-Step Instructions:**
1. Create root layout component at `src/app/layout.tsx` with responsive header
2. Build mobile hamburger menu with slide-out navigation
3. Implement desktop horizontal navigation with proper hover states
4. Create responsive footer with social links and platform information
5. Add breadcrumb component for dashboard navigation
6. Implement theme provider for consistent styling across components
7. Build loading component with CulturaLite branding
8. Add error boundary components for graceful error handling
9. Ensure proper focus management for keyboard navigation
10. Implement scroll-to-top functionality for long pages
11. Add proper meta tags and SEO optimization in layout

**Code Examples, Data Structures & Constraints:**
```typescript
// Navigation structure
interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  requiresAuth?: boolean;
}

// Responsive breakpoints (Tailwind)
sm: '640px'   // Mobile landscape
md: '768px'   // Tablet
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
```

Use shadcn/ui Sheet (for mobile menu), Button, and navigation components. Implement proper ARIA labels and semantic HTML. DO NOT include page-specific content or authentication logic.

**Define a Strict Scope:** Create only layout, navigation, and shared UI components. Do NOT modify page-specific components or authentication flows.

---

---

### Prompt 6: City-Specific Event Listings with SEO

**High-Level Goal:** Create dynamic city-specific event listing pages with SEO optimization and server-side rendering for search engine visibility.

**Detailed, Step-by-Step Instructions:**
1. Create dynamic route at `src/app/events/[city]/page.tsx` using Next.js App Router
2. Implement server-side rendering with proper metadata generation for SEO
3. Build city-specific event grid with same filtering capabilities as homepage
4. Add city-specific breadcrumb navigation (Home > Events > [City Name])
5. Implement proper URL structure and canonical tags
6. Create city landing page hero section with local cultural imagery
7. Add structured data markup for events (JSON-LD schema)
8. Implement pagination for cities with many events
9. Build "Other Cities" suggestion section at bottom
10. Ensure proper 404 handling for invalid city names
11. Add social media meta tags for sharing

**Code Examples, Data Structures & Constraints:**
```typescript
// Dynamic route params
interface PageProps {
  params: { city: string };
  searchParams: { category?: string };
}

// SEO metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Cultural Events in ${params.city} | CulturaLite`,
    description: `Discover vibrant cultural events in ${params.city}. Find festivals, concerts, and cultural celebrations.`,
    openGraph: {
      title: `Cultural Events in ${params.city}`,
      description: `Discover vibrant cultural events in ${params.city}`,
    },
  };
}

// API call with city filter
GET /api/events/?city=${params.city}
```

Use Next.js metadata API, implement proper canonical URLs, and ensure mobile-first responsive design. DO NOT create authentication or vendor-specific features.

**Define a Strict Scope:** Create only city-specific listing pages and SEO components. Do NOT modify homepage, dashboard, or authentication components.

---

### Prompt 7: Advanced Data Visualization Dashboard

**High-Level Goal:** Create an analytics dashboard component for vendors to visualize their event performance and engagement metrics.

**Detailed, Step-by-Step Instructions:**
1. Create analytics page at `src/app/dashboard/analytics/page.tsx`
2. Build chart components using a library like Recharts or Chart.js
3. Implement event performance metrics (views, clicks, status distribution)
4. Create date range picker for filtering analytics data
5. Add key performance indicators (KPIs) cards showing total events, approval rate
6. Build responsive chart layouts that work on mobile devices
7. Implement data export functionality (CSV/PDF)
8. Add comparison features (this month vs last month)
9. Create loading states for chart data fetching
10. Implement error handling for analytics API failures
11. Add tooltips and interactive chart elements

**Code Examples, Data Structures & Constraints:**
```typescript
// Analytics data structure
interface EventAnalytics {
  event_id: number;
  title: string;
  views: number;
  clicks: number;
  status: string;
  submission_date: string;
  approval_date?: string;
}

// KPI data structure
interface DashboardKPIs {
  total_events: number;
  approved_events: number;
  pending_events: number;
  approval_rate: number;
  avg_approval_time: number;
}

// API endpoint
GET /api/dashboard/analytics/?start_date=2024-01-01&end_date=2024-12-31
```

Use shadcn/ui components for layout and Recharts for visualizations. Implement proper loading skeletons and responsive design. DO NOT include event submission or authentication logic.

**Define a Strict Scope:** Create only analytics and data visualization components. Do NOT modify other dashboard pages or authentication flows.

---

## Implementation Guidelines & Best Practices

### Foundational Context for All Prompts

**Project Overview:** CulturaLite is a cultural event listing platform built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components. The backend is Django with PostgreSQL, deployed on Vercel (frontend) and Render (backend).

**Tech Stack:**
- **Frontend:** Next.js 14.2, TypeScript 5.4, Tailwind CSS 3.4.1, shadcn/ui 0.8.0
- **State Management:** React Context API for global state, React hooks for local state
- **Data Fetching:** SWR or TanStack Query for server state management
- **Authentication:** JWT tokens with Django backend
- **Image Management:** Cloudinary API integration
- **Testing:** Jest + React Testing Library for unit tests, Playwright for E2E

**Design System:**
- **Colors:** Primary #F97316 (Orange), Accent #22C55E (Green), Backgrounds: White/#F3F4F6
- **Typography:** Inter font family for all text
- **Component Library:** shadcn/ui for consistent, accessible components
- **Responsive Strategy:** Mobile-first design with Tailwind breakpoints

### Critical Implementation Notes

1. **Mobile-First Approach:** All components must be designed for mobile screens first, then enhanced for larger screens using Tailwind's responsive prefixes (sm:, md:, lg:, xl:).

2. **Authentication Flow:** Protected routes should check for valid JWT tokens and redirect to `/login` if unauthorized. Use React Context for global auth state management.

3. **API Integration:** All API calls should include proper error handling, loading states, and use the centralized API client with automatic JWT token attachment.

4. **Accessibility:** Implement WCAG 2.1 AA compliance with proper ARIA labels, semantic HTML, keyboard navigation, and sufficient color contrast.

5. **Performance:** Leverage Next.js SSR/SSG for public pages, implement proper image optimization, and use loading skeletons for better perceived performance.

6. **Error Handling:** Implement comprehensive error boundaries, user-friendly error messages, and graceful degradation for network failures.

### Code Quality Standards

- Use TypeScript interfaces for all data structures
- Implement proper prop validation and default values
- Follow React best practices (hooks, functional components)
- Use semantic HTML elements for better SEO and accessibility
- Implement proper loading and error states for all async operations
- Write clean, self-documenting code with meaningful variable names

### Testing Considerations

Each component should be designed with testability in mind:
- Separate business logic from UI components
- Use data-testid attributes for testing selectors
- Mock external dependencies (APIs, Cloudinary)
- Test user interactions and edge cases
- Ensure components work without JavaScript (progressive enhancement)

---

## Key Activities & Instructions

### 1. Core Prompting Principles

Before generating the prompt, you must understand these core principles for interacting with a generative AI for code.

- **Be Explicit and Detailed**: The AI cannot read your mind. Provide as much detail and context as possible. Vague requests lead to generic or incorrect outputs.
- **Iterate, Don't Expect Perfection**: Generating an entire complex application in one go is rare. The most effective method is to prompt for one component or one section at a time, then build upon the results.
- **Provide Context First**: Always start by providing the AI with the necessary context, such as the tech stack, existing code snippets, and overall project goals.
- **Mobile-First Approach**: Frame all UI generation requests with a mobile-first design mindset. Describe the mobile layout first, then provide separate instructions for how it should adapt for tablet and desktop.

### 2. The Structured Prompting Framework

To ensure the highest quality output, you MUST structure every prompt using the following four-part framework.

1. **High-Level Goal**: Start with a clear, concise summary of the overall objective. This orients the AI on the primary task.
   - _Example: "Create a responsive user registration form with client-side validation and API integration."_
2. **Detailed, Step-by-Step Instructions**: Provide a granular, numbered list of actions the AI should take. Break down complex tasks into smaller, sequential steps. This is the most critical part of the prompt.
   - _Example: "1. Create a new file named `RegistrationForm.js`. 2. Use React hooks for state management. 3. Add styled input fields for 'Name', 'Email', and 'Password'. 4. For the email field, ensure it is a valid email format. 5. On submission, call the API endpoint defined below."_
3. **Code Examples, Data Structures & Constraints**: Include any relevant snippets of existing code, data structures, or API contracts. This gives the AI concrete examples to work with. Crucially, you must also state what _not_ to do.
   - _Example: "Use this API endpoint: `POST /api/register`. The expected JSON payload is `{ "name": "string", "email": "string", "password": "string" }`. Do NOT include a 'confirm password' field. Use Tailwind CSS for all styling."_
4. **Define a Strict Scope**: Explicitly define the boundaries of the task. Tell the AI which files it can modify and, more importantly, which files to leave untouched to prevent unintended changes across the codebase.
   - _Example: "You should only create the `RegistrationForm.js` component and add it to the `pages/register.js` file. Do NOT alter the `Navbar.js` component or any other existing page or component."_

### 3. Usage Instructions for AI Frontend Generation

**How to Use These Prompts:**

1. **Select the Appropriate Prompt:** Choose the prompt that matches your current development need (homepage, authentication, dashboard, etc.).

2. **Customize for Your AI Tool:**
   - **For v0 (Vercel):** Copy the entire prompt including the foundational context
   - **For Cursor:** Use the prompt in a new file with proper file path context
   - **For Lovable:** Include the tech stack information and component requirements

3. **Iterative Development:** Start with one prompt, review the generated code, then move to the next component. Don't try to generate the entire application at once.

4. **Integration Steps:**
   - Review generated code for consistency with project standards
   - Test components in isolation before integration
   - Ensure proper TypeScript interfaces and prop validation
   - Verify responsive design across device sizes
   - Test accessibility features and keyboard navigation

**Prompt Execution Order:**
1. Start with **Prompt 5** (Navigation/Layout) to establish the foundation
2. Implement **Prompt 1** (Homepage) for the public-facing experience
3. Build **Prompt 2** (Authentication) for user management
4. Create **Prompt 3** (Dashboard) for vendor experience
5. Add **Prompt 4** (Event Submission) for content creation
6. Implement **Prompt 6** (City Pages) for SEO optimization
7. Optional: **Prompt 7** (Analytics) for advanced features

### 4. Quality Assurance Checklist

After generating code with any prompt, verify:

**Functionality:**
- [ ] Component renders without errors
- [ ] All interactive elements work as expected
- [ ] API integration follows the specified endpoints
- [ ] Loading and error states are properly handled
- [ ] Form validation works correctly

**Design & UX:**
- [ ] Matches the CulturaLite color palette and typography
- [ ] Responsive design works on mobile, tablet, and desktop
- [ ] Consistent with shadcn/ui component patterns
- [ ] Proper spacing and visual hierarchy
- [ ] Cultural theme is appropriately reflected

**Technical Standards:**
- [ ] TypeScript interfaces are properly defined
- [ ] Components follow React best practices
- [ ] Proper error boundaries are implemented
- [ ] Code is clean and well-commented
- [ ] No console errors or warnings

**Accessibility:**
- [ ] Proper semantic HTML structure
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG standards
- [ ] Screen reader compatibility

**Performance:**
- [ ] Images are optimized and properly sized
- [ ] No unnecessary re-renders
- [ ] Proper loading states prevent layout shift
- [ ] Bundle size impact is reasonable

### 5. Integration with Existing Codebase

When integrating AI-generated components:

1. **File Structure:** Ensure components are placed in the correct directories according to the project architecture
2. **Import Paths:** Update import statements to match the project's path structure
3. **API Client:** Replace placeholder API calls with the project's centralized API client
4. **Type Definitions:** Move interfaces to shared type files if used across components
5. **Styling:** Verify Tailwind classes work with the project's configuration
6. **Testing:** Add appropriate test files for new components

### 6. Common Pitfalls and Solutions

**Issue:** Generated code doesn't match project structure
**Solution:** Provide more specific file path context in your prompt

**Issue:** Components don't integrate well together
**Solution:** Use the foundational context section in every prompt

**Issue:** Styling inconsistencies
**Solution:** Always reference the design system specifications

**Issue:** API integration problems
**Solution:** Include actual API endpoint documentation in prompts

**Issue:** TypeScript errors
**Solution:** Provide complete interface definitions and ensure proper typing

---

## Conclusion

These comprehensive AI frontend generation prompts are specifically crafted for the CulturaLite project, incorporating all requirements from the PRD, architecture documentation, and frontend specifications. Each prompt follows the structured four-part framework to ensure high-quality, consistent output from AI tools.

**Key Benefits:**
- **Targeted Approach:** Each prompt focuses on a specific feature area
- **Comprehensive Context:** All prompts include necessary technical and design context
- **Production-Ready:** Generated code follows best practices and project standards
- **Scalable:** Prompts can be modified for future feature additions

**Important Reminder:** All AI-generated code requires careful human review, testing, and refinement before being considered production-ready. Use these prompts as a starting point to accelerate development, but always validate functionality, security, accessibility, and performance before deployment.

The prompts are designed to work iteratively - start with foundational components and build up to more complex features. This approach ensures better integration and reduces the likelihood of conflicts between generated components.
