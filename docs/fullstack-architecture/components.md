# Components

### Frontend Application (Next.js)

  * **Responsibility:** To provide the entire user interface and experience for both public users and authenticated vendors. This component is responsible for rendering all pages, managing UI state (e.g., filters), handling user input, and communicating securely with the backend API.
  * **Key Interfaces:**
      * Renders HTML, CSS, and JavaScript to the user's web browser.
      * Consumes the Backend REST API for all dynamic data.
  * **Dependencies:** Relies on the `Backend API` for data, authentication, and event submission.
  * **Technology Stack:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui.

### Backend API (Django)

  * **Responsibility:** To act as the system's brain, handling all business logic, data persistence, and security. It serves data to the frontend, processes new event submissions from vendors, manages user accounts and roles, and handles the creation of notifications.
  * **Key Interfaces:**
      * Exposes a REST API for the Frontend Application.
      * Connects to the PostgreSQL Database to read and write data.
      * Communicates with the Cloudinary API to manage image uploads.
  * **Dependencies:** Depends on the `Database` for data storage and the `Image Service` for file handling.
  * **Technology Stack:** Django, Django REST Framework, Python, SimpleJWT.

### Database (PostgreSQL)

  * **Responsibility:** To provide reliable and persistent storage for all application data. This includes information about users, categories, events, and notifications. It is the ultimate source of truth for the application's state.
  * **Key Interfaces:** A standard SQL interface, consumed exclusively by the `Backend API`. The frontend will never connect to the database directly.
  * **Dependencies:** None.
  * **Technology Stack:** PostgreSQL (Managed by Render).

### Image Service (Cloudinary)

  * **Responsibility:** To handle all aspects of image management. This includes accepting uploads from the backend, storing the images securely, and providing optimized image URLs for fast delivery on a global Content Delivery Network (CDN).
  * **Key Interfaces:**
      * An upload API for the `Backend API`.
      * Image delivery URLs consumed by the `Frontend Application`.
  * **Dependencies:** None (Third-Party Service).
  * **Technology Stack:** Cloudinary API.

### Component Diagram

This diagram shows how the main components interact within the context of the overall system.

```mermaid
 C4Context
  title System Component Diagram for CulturaLite

  Person(public_user, "Public User", "Browses events.")
  Person(vendor, "Vendor", "Submits and manages events.")
  System(admin_ui, "Django Admin", "Used by Admins for moderation.")

  System_Boundary(c1, "CulturaLite System") {
    Component(frontend, "Frontend App", "Next.js", "Displays UI, handles user interaction. Deployed on Vercel.")
    Component(backend, "Backend API", "Django/DRF", "Provides business logic, serves data. Deployed on Render.")
    ComponentDb(db, "Database", "PostgreSQL", "Stores all application data.")
  }

  System_Ext(cloudinary, "Cloudinary", "Image Storage & CDN")

  public_user --> frontend: "Uses"
  vendor --> frontend: "Uses"
  admin_ui --|> backend: "Manages data via"

  Rel(frontend, backend, "Makes API calls to", "HTTPS/REST")
  Rel(frontend, cloudinary, "Requests images from", "HTTPS")
  Rel(backend, db, "Reads/Writes", "SQL")
  Rel(backend, cloudinary, "Uploads images to", "API")
```
