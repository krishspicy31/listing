# Core Workflows

### Workflow 1: Public User Fetches Events

This diagram shows how a public user visiting the homepage receives the list of approved events, leveraging Next.js's Server-Side Rendering (SSR) for performance and SEO.

```mermaid
sequenceDiagram
    participant Browser as User's Browser
    participant Frontend as Next.js Frontend (Vercel)
    participant Backend as Django Backend (Render)
    participant DB as PostgreSQL Database

    Browser->>+Frontend: GET / (Requests Homepage)
    Note over Frontend: Server-Side Rendering begins
    Frontend->>+Backend: GET /api/events/
    Backend->>+DB: SELECT * FROM events WHERE status='approved'
    DB-->>-Backend: Returns approved events data
    Backend-->>-Frontend: JSON response with events
    Note over Frontend: Renders HTML page with event data
    Frontend-->>-Browser: Sends complete HTML page
```

### Workflow 2: Vendor Submits a New Event

This diagram details the authenticated process for a vendor submitting a new event, including the secure interaction with the Cloudinary image service.

```mermaid
sequenceDiagram
    participant Browser as Vendor's Browser
    participant Frontend as Next.js Frontend (Vercel)
    participant Backend as Django Backend (Render)
    participant Cloudinary as Cloudinary API
    participant DB as PostgreSQL Database

    Browser->>+Frontend: Submits New Event Form
    Note over Frontend: Bundles form data and JWT
    Frontend->>+Backend: POST /api/events/submit (with data & JWT)
    Backend->>Backend: 1. Validate JWT & Permissions
    Backend->>+Cloudinary: 2. Upload Image Stream
    Cloudinary-->>-Backend: Returns secure image_url
    Backend->>+DB: 3. INSERT new event with image_url
    DB-->>-Backend: Confirms save
    Backend-->>-Frontend: Success Response (201 Created)
    Frontend-->>-Browser: Displays "Submission successful" message
```
