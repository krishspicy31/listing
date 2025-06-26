# CulturaLite Product Requirements Document (PRD)

## Goals and Background Context

### Goals

* Successfully launch the MVP platform within the planned timeframe.
* Onboard a target number of event organizers within the first 6 months.
* Achieve first-page search engine ranking for "Indian cultural events in [target city]".
* Ensure high vendor satisfaction with the event submission and management process.
* Achieve high public user engagement, measured by low bounce rates and high usage of filter features.
* Maintain a consistent flow of new event submissions from vendors.

### Background Context

CulturaLite is a lightweight, full-stack event listing platform designed to solve the problem of fragmented and inefficient event discovery for the Indian cultural niche. Currently, event information is scattered across various platforms, making it difficult for the public to discover events and for organizers to reach their target audience.

The platform will provide a clean, fast, and SEO-optimized central hub for this community. It will feature distinct workflows for vendors to submit and manage events, for admins to moderate content, and for the public to discover and filter approved cultural events.

## Requirements

### Functional

* **FR1**: The system must display approved cultural events on a homepage, with options to filter the events by city and category.
* **FR2**: The system must provide city-specific event listing pages using an SEO-friendly URL structure (e.g., `/events/[city]`).
* **FR3**: The system must provide a secure vendor dashboard that requires registration and login.
* **FR4**: The vendor dashboard must contain a form for submitting new events, including fields for title, description, image upload, city, and category.
* **FR5**: Vendors must be able to view the status of their submitted events (e.g., pending, approved, rejected) within their dashboard.
* **FR6**: An admin interface must exist to allow authorized administrators to approve or reject event submissions.
* **FR7**: The system must automatically send email notifications to vendors when the status of their event submission changes.

### Non-Functional

* **NFR1**: The application must be optimized for search engines to ensure high visibility for city-specific event searches.
* **NFR2**: The user interface must be highly performant, with fast page loads, and a clean, colorful, and aesthetically pleasing design.
* **NFR3**: The system must integrate with Cloudinary for robust and scalable image hosting and management.
* **NFR4**: Authentication must be implemented using Django with JWT to support secure, role-based access control.
* **NFR5**: The architecture must support deployment to the specified hosting platforms (Vercel for frontend, Render for backend).

## User Interface Design Goals

### Overall UX Vision

The user experience should be clean, colorful, fast, and intuitive. The design should feel modern and welcoming, reflecting the vibrancy of Indian culture without becoming cluttered or overwhelming. For vendors, the workflow from login to event submission must be streamlined and efficient. For the public, the experience should be focused on joyful discovery and easy filtering.

### Key Interaction Paradigms

* **Card-Based Layout**: Events will be displayed in a grid of cards, each providing a snapshot of key information.
* **Filter & Search**: The primary interaction for public users will be filtering events by city and category.
* **Dashboard Interface**: Vendors will manage their events from a clean, private dashboard.
* **Form-Based Submission**: Event creation will be handled through a multi-step or single-page form with clear validation.
* **Component-Driven UI**: The interface will be built using a consistent library of components (shadcn/ui).

### Core Screens and Views

* **Public-Facing Pages**:
    * Homepage (with event grid and filters)
    * City-Specific Event Listings Page
* **Vendor-Facing Pages**:
    * Login & Registration Page
    * Vendor Dashboard (view submitted events and their status)
    * Event Submission Form
* **Admin-Facing Interface**:
    * Django Admin Panel (for moderation)

### Accessibility

*To be determined, but aiming for modern best practices.*

### Branding

* **Font**: Inter
* **Color Palette**:
    * Primary: `#F97316` (Orange)
    * Accent: `#22C55E` (Green)
    * Backgrounds: White and light gray, with festive color accents used thoughtfully.

### Target Device and Platforms

* Web Responsive, designed to work seamlessly on modern browsers across both desktop and mobile devices.

## Technical Assumptions

### Repository Structure

A **Polyrepo** (two separate repositories) is recommended. One repository will contain the Next.js frontend application, and a second repository will contain the Django backend. This approach provides a clean separation of concerns and aligns perfectly with the specified Vercel (frontend) and Render (backend) deployment targets.

### Service Architecture

The backend will be a **Monolithic Service**. The Django application will be responsible for handling all business logic, database interactions, user authentication, and serving data to the frontend via a REST API built with the Django REST Framework.

### Testing requirements

A comprehensive testing strategy is required. The Architect will define the specific frameworks and coverage goals for unit, integration, and end-to-end tests in the architecture document.

### Additional Technical Assumptions and Requests

The following technologies are confirmed for the project:

* **Frontend**: Next.js with Tailwind CSS v3.4.1 and shadcn/ui for a modern, performant, and SEO-friendly user interface.
* **Backend**: Django and Django REST Framework for rapid, secure backend development and a powerful built-in admin panel.
* **Database**: PostgreSQL (hosted on Neon or similar) for a reliable and scalable relational data store.
* **Authentication**: Django Auth with SimpleJWT to manage secure, role-based user access.
* **Image Management**: Cloudinary will be used to offload image storage, optimization, and delivery.
* **Hosting**: The application will be hosted on Vercel (frontend) and Render (backend), providing a modern, CI/CD-friendly deployment workflow.

## Epics 

* **Epic 1: Foundation & Public Event Discovery**: Establish the core project infrastructure (Next.js, Django, DB), and build the public-facing pages where users can discover and filter approved events.
* **Epic 2: Vendor & Admin Workflows**: Implement the complete workflow for the supply side, including vendor registration, the dashboard for event submission, and the admin panel for moderation.

## Epic 1: Foundation & Public Event Discovery

**Goal:** The primary objective of this epic is to build the public-facing, visible part of CulturaLite and the core backend infrastructure it relies on. By the end of this epic, the application will be set up, and anonymous users will be able to visit the site, see a grid of pre-approved events, and filter them. This delivers immediate value by making the platform discoverable and useful to the public from day one.

### Story 1.1: Core Project Setup

* **As a** Developer,
* **I want to** set up the initial Next.js frontend and Django backend projects with their repository structures,
* **so that** we have a clean foundation for development.

#### Acceptance Criteria

1.  A new repository is created for the Next.js frontend project.
2.  A new repository is created for the Django backend project.
3.  Both projects can be run locally to display a basic placeholder or "hello world" page.
4.  Initial project stubs are created on Vercel (for frontend) and Render (for backend) and are linked to the repositories.

### Story 1.2: Define Core Event & Category Models

* **As a** Developer,
* **I want to** implement the core Django models for Events and Categories,
* **so that** we can store and manage event data in the database.

#### Acceptance Criteria

1.  A `Category` model with a `name` field is created in the Django backend.
2.  An `Event` model is created with fields for `title`, `description`, `city`, `event_date`, and `status` (with choices: pending, approved, rejected).
3.  A relationship is established so that each `Event` belongs to a `Category`.
4.  The initial database migration can be created and applied successfully to the PostgreSQL database.
5.  Both `Event` and `Category` models are registered and visible in the Django Admin interface.

### Story 1.3: Create Public API for Approved Events

* **As a** Frontend Developer,
* **I want** a public, read-only API endpoint that returns a list of all *approved* events,
* **so that** I can fetch and display them on the public-facing pages.

#### Acceptance Criteria

1.  A GET endpoint is created at `/api/events/` using Django REST Framework.
2.  The endpoint exclusively returns events where the `status` is 'approved'.
3.  The JSON response for each event includes at least its title, image URL, event date, city, and category name.
4.  The endpoint can be filtered by `city` using a query parameter (e.g., `/api/events/?city=Chennai`).
5.  The endpoint can be filtered by `category` using a query parameter (e.g., `/api/events/?category=Dance`).

### Story 1.4: Build Homepage with Event Grid

* **As a** Public User,
* **I want to** see a grid of colorful event cards on the homepage,
* **so that** I can quickly get an overview of what's happening.

#### Acceptance Criteria

1.  The Next.js homepage fetches data from the `/api/events/` endpoint on page load.
2.  Events are displayed in a responsive grid using shadcn/ui `Card` components.
3.  Each card clearly displays the event's image, title, date, and city.
4.  A loading indicator is shown while the event data is being fetched.
5.  A user-friendly message is displayed if no approved events are available.

### Story 1.5: Implement Homepage Filters

* **As a** Public User,
* **I want to** filter the events on the homepage by city and category,
* **so that** I can easily find events that are relevant to me.

#### Acceptance Criteria

1.  Dropdown or selectable filters for 'City' and 'Category' are rendered on the homepage.
2.  The lists of available cities and categories are dynamically populated from the backend.
3.  Changing a filter's value triggers a new API call with the correct query parameters.
4.  The event grid updates to display only the events matching the selected filters.

## Epic 2: Vendor & Admin Workflows

**Goal:** This epic focuses on building the 'supply-side' of the platform. It will enable event organizers (vendors) to create accounts, log in, and submit their events for moderation. It also includes the necessary tools for administrators to review and approve these submissions and an in-dashboard system for vendors to receive notifications about their submission status.

### Story 2.1: Implement Vendor Registration & JWT Login

* **As a** Vendor,
* **I want to** create an account and log in securely,
* **so that** I can access my private dashboard to submit events.

#### Acceptance Criteria

1.  A user registration API endpoint is created in the Django backend.
2.  A login API endpoint is created that returns a JWT token upon successful authentication.
3.  A specific 'Vendor' user role is established to differentiate from 'Admin' users.
4.  The Next.js frontend provides clear Registration and Login pages with the necessary forms.
5.  Upon successful login, the returned JWT is securely stored on the client-side.
6.  Subsequent authenticated API requests from the frontend correctly include the JWT for authorization.

### Story 2.2: Build Event Submission Form

* **As a** logged-in Vendor,
* **I want to** fill out a form to submit a new event, including an image,
* **so that** it can be reviewed for public listing.

#### Acceptance Criteria

1.  A secure, authenticated API endpoint is created to accept new event submissions.
2.  The backend automatically associates each new event with the currently authenticated vendor.
3.  All newly submitted events default to a 'pending' status.
4.  The frontend features a dedicated page with a form for event submission.
5.  The form correctly integrates with Cloudinary for image uploads, and the resulting image URL is saved with the event data.
6.  The vendor is redirected to their dashboard with a success message after submitting the form.

### Story 2.3: Create Vendor Dashboard with Event List

* **As a** logged-in Vendor,
* **I want to** see a list of all the events I have submitted and their current status,
* **so that** I can track my submissions.

#### Acceptance Criteria

1.  A secure API endpoint is created that returns a list of events submitted *only* by the currently authenticated vendor.
2.  A private dashboard page is created in the frontend, accessible only to logged-in vendors.
3.  The dashboard displays a list or table of the vendor's events, showing at a minimum the event title and its current status ('Pending', 'Approved', 'Rejected').

### Story 2.4: Enable Admin Moderation in Django Admin

* **As an** Admin,
* **I want to** use the Django Admin interface to review pending events and approve or reject them,
* **so that** I can curate the content on the public site.

#### Acceptance Criteria

1.  The `Event` model in the Django Admin is configured to easily filter for events with a 'pending' status.
2.  An Admin user can directly change an event's status to 'approved' or 'rejected' from the event's detail page in the Django Admin.
3.  Saving this change correctly updates the event's status in the database.

### Story 2.5: Implement In-Dashboard Notifications

* **As a** logged-in Vendor,
* **I want to** see a notification on my dashboard when the status of my event is changed by an admin,
* **so that** I am immediately aware of the outcome.

#### Acceptance Criteria

1.  A `Notification` model is created in the Django backend that links a message to a specific vendor and event.
2.  When an admin approves or rejects an event, a new `Notification` is automatically created for that event's vendor.
3.  A secure API endpoint is created for a vendor to fetch their notifications.
4.  The vendor dashboard UI displays a notification indicator (e.g., a bell icon) and a list of recent, human-readable notifications (e.g., "Your event 'Holi Festival 2025' was approved.").
5.  A mechanism exists for the vendor to mark notifications as 'read'.

