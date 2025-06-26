# Unified Project Structure

### Frontend Project Structure (`culturalite-frontend`)

This structure is based on the Next.js 14 App Router and our feature-based component organization.

```plaintext
culturalite-frontend/
├── .next/                    # Next.js build output (git-ignored)
├── public/                     # Static assets (images, fonts, etc.)
├── src/                        # Main application source code
│   ├── app/                    # Next.js App Router (all pages and layouts)
│   │   ├── dashboard/          # Routes and layout for the vendor dashboard
│   │   ├── events/             # Routes for event listings
│   │   ├── (api)/              # API route handlers (if any frontend-specific)
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── components/
│   │   ├── shared/             # App-wide components (Header, Footer)
│   │   └── ui/                 # Base shadcn/ui components (Button, Card)
│   ├── features/               # Feature-specific logic and components
│   │   ├── event-discovery/
│   │   └── vendor-dashboard/
│   ├── lib/                    # Libraries and helper functions (e.g., apiClient.ts)
│   └── styles/                 # Global styles
├── .eslintrc.json              # ESLint configuration
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

### Backend Project Structure (`culturalite-backend`)

This is a standard, modular structure for a Django project.

```plaintext
culturalite-backend/
├── culturalite_backend/        # Core Django project configuration
│   ├── settings.py             # Project settings
│   ├── urls.py                 # Root URL configuration
│   └── wsgi.py                 # WSGI entry point
├── apps/                       # Directory for all Django apps
│   ├── events/                 # App for event models, views, and URLs
│   ├── users/                  # App for custom user model and auth views
│   └── notifications/          # App for notification logic
├── media/                      # User-uploaded files (development only)
├── static/                     # Static files for Django Admin
├── .gitignore                  # Git ignore file
├── manage.py                   # Django's command-line utility
└── requirements.txt            # Python dependencies
```

### Development Workflow

* **Local Setup:** Developers will maintain two separate local repositories (`culturalite-frontend` and `culturalite-backend`). Both will need to be run concurrently during development for a full-stack experience. Environment variables (like the backend API URL for the frontend) will be managed via `.env.local` files.
* **Core Commands:**
    * Frontend: `npm run dev`
    * Backend: `python manage.py runserver`

### Deployment Architecture

* **Strategy:** We will use a CI/CD (Continuous Integration/Continuous Deployment) model managed by our hosting platforms.
* **Frontend (Vercel):** Every `git push` to the `main` branch will automatically trigger a new production deployment. Pushes to other branches will create unique preview deployments for testing.
* **Backend (Render):** Similarly, every `git push` to the `main` branch will automatically build and deploy the Django application.

### Testing Strategy

* **Approach:** A comprehensive testing pyramid will be enforced.
* **Unit Tests:** All critical functions and components will have unit tests (using Jest/RTL for frontend, Pytest for backend).
* **Integration Tests:** We will test the connection between components, such as API views and the database.
* **End-to-End (E2E) Tests:** Key user flows, such as event submission, will be tested with Playwright to simulate real user interaction.

### Security, Performance, and Error Handling

* **Security:** We will adhere to standard security practices. This includes using Django's built-in security features, storing all secrets and keys as environment variables, validating all user input on the backend, and protecting all vendor- and admin-specific API endpoints.
* **Performance:** The architecture is designed for performance by using Next.js's server-side rendering for fast initial loads, database indexing for quick lookups, and Cloudinary for optimized image delivery.
* **Error Handling:** The backend API will return structured JSON error responses. The frontend will be responsible for catching these errors and displaying user-friendly messages, avoiding technical jargon.

### Coding Standards

* **Style Guide:** Code style will be enforced automatically using standard tools: `ESLint` and `Prettier` for the frontend, and `Black` for the backend.
* **Naming Conventions:** We will follow idiomatic conventions for each language (e.g., `camelCase` for JavaScript/TypeScript functions, `PascalCase` for React components, and `snake_case` for Python functions and variables).

