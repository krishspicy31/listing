# Epic 1: Foundation & Public Event Discovery

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
