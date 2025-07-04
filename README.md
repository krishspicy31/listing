# Culturalite

A platform connecting people with cultural events and experiences. Built with Next.js frontend and Django backend in a Turborepo monorepo structure.

## Project Structure

This Turborepo monorepo contains frontend, backend, and testing applications:

```
culturalite/
├── apps/
│   ├── frontend/          # Next.js 14 frontend application
│   └── backend/           # Django 5.0 backend API
├── packages/
│   └── e2e-tests/         # Playwright end-to-end tests
├── src/                   # Shared types and utilities
├── docs/                  # Project documentation
├── turbo.json            # Turborepo configuration
└── package.json          # Root workspace configuration
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- Python 3.8+
- Git

### Installation

1. **Clone and install all dependencies:**
```bash
git clone <repository-url>
cd culturalite
npm install  # This automatically installs both Node.js and Python dependencies
```

2. **Configure environment files:**
```bash
# Frontend environment (if template exists)
cd apps/frontend
cp .env.local.template .env.local
cd ../..

# Backend environment (if template exists)
cd apps/backend
cp .env.template .env
cd ../..
```

3. **Run initial database migration:**
```bash
cd apps/backend
python3 manage.py migrate
cd ../..
```

> **Note:** The `npm install` command automatically runs `postinstall` which installs Python dependencies for the backend using `pip3 install -r requirements.txt`.

### Development

**Start all applications in development mode:**
```bash
npm run dev
```

**Or start individual applications:**
```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

- Frontend: http://localhost:3000
- Backend API: http://127.0.0.1:8000

## Tech Stack

### Frontend
- Next.js 14.2 with App Router
- TypeScript 5.4
- Tailwind CSS 3.4.1
- shadcn/ui 0.8.0
- Jest & React Testing Library

### Backend
- Django 5.0
- Django REST Framework 3.15
- PostgreSQL (Neon) / SQLite
- JWT Authentication
- Django TestCase

## Turborepo Commands

This project uses [Turborepo](https://turbo.build/) for efficient monorepo management with caching and parallel execution.

### Common Commands

```bash
# Build all packages
npm run build

# Run all packages in development mode
npm run dev

# Run tests across all packages
npm run test

# Run linting across all packages
npm run lint

# Clean all build artifacts
npm run clean
```

### Filtered Commands

Run commands for specific packages using Turborepo filters:

```bash
# Frontend specific
npm run build:frontend
npm run dev:frontend
npm run test:frontend

# Backend specific
npm run build:backend
npm run dev:backend
npm run test:backend

# E2E tests only
npm run test:e2e:only
```

### Advanced Turborepo Usage

```bash
# Run with verbose output
npx turbo build --verbose

# Force rebuild (ignore cache)
npx turbo build --force

# Run in parallel with custom concurrency
npx turbo test --concurrency=4

# Generate dependency graph
npx turbo build --graph

# Run only changed packages
npx turbo build --filter="[HEAD^1]"
```

### Caching

Turborepo automatically caches build outputs and test results. The cache is stored in `.turbo/` and significantly speeds up subsequent runs.

## Development Workflow

1. **Start development servers:**
   ```bash
   npm run dev
   ```

2. **Make changes** to any package

3. **Run tests:**
   ```bash
   npm run test
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Testing

### Run All Tests
```bash
npm run test
```

### Frontend Tests
```bash
npm run test:frontend
# Or with coverage
npm run test:coverage --filter=frontend
```

### Backend Tests
```bash
npm run test:backend
# Or directly in the backend directory
cd apps/backend
python manage.py test tests
```

### E2E Tests
```bash
npm run test:e2e:only
# Or with UI mode
cd packages/e2e-tests
npm run test:ui
```

## Deployment

### Full-Stack Deployment on Vercel

This project is configured for full-stack deployment on Vercel, running both the Next.js frontend and Django backend:

#### Architecture
- **Frontend**: Next.js app served from `/`
- **Backend**: Django API served from `/api/*`
- **Database**: SQLite (development) or PostgreSQL (production)

#### Configuration Files
- `vercel.json`: Deployment configuration
- `requirements.txt`: Python dependencies for Vercel
- `apps/backend/vercel_app.py`: WSGI entry point
- `apps/backend/culturalite_backend/vercel_settings.py`: Production settings

#### Environment Variables (Set in Vercel Dashboard)
```bash
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.vercel.app
```

#### API Routes
- Frontend: `https://your-app.vercel.app/`
- Backend API: `https://your-app.vercel.app/api/`

### Alternative: Separate Deployments

If you prefer to deploy separately:

#### Frontend Only (Vercel)
```bash
# Update vercel.json to only build frontend
turbo build --filter=frontend
```

#### Backend Only (Railway/Render)
```bash
# Deploy backend separately
npm run build:production --workspace=backend
```

### Database Options

- **Development**: SQLite (included)
- **Production**: PostgreSQL (Neon, Supabase, PlanetScale)

## Environment Setup

Each application has its own environment configuration:

- Frontend: `.env.local` (see `.env.local.template`)
- Backend: `.env` (see `.env.template`)

## Documentation

Detailed documentation is available in the `docs/` directory:

- Architecture documentation
- API specifications
- Deployment guides
- Development stories

## Contributing

1. Clone the repository
2. Set up both frontend and backend environments
3. Run tests to ensure everything works
4. Make your changes
5. Run tests again
6. Submit a pull request

## License

This project is part of the Culturalite platform development.
