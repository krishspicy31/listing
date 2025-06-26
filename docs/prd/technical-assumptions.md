# Technical Assumptions

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
