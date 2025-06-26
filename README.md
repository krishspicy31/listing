# Culturalite

A platform connecting people with cultural events and experiences. Built with Next.js frontend and Django backend in a monorepo structure.

## Project Structure

This monorepo contains both frontend and backend applications:

```
culturalite/
├── culturalite-frontend/   # Next.js 14 frontend application
├── culturalite-backend/    # Django 5.0 backend API
├── docs/                   # Project documentation
└── .bmad-core/            # Agent configuration
```

## Quick Start

### Frontend (Next.js)

```bash
cd culturalite-frontend
npm install
cp .env.local.template .env.local
npm run dev
```

Frontend will be available at: http://localhost:3000

### Backend (Django)

```bash
cd culturalite-backend
pip install -r requirements.txt
cp .env.template .env
python manage.py migrate
python manage.py runserver
```

Backend API will be available at: http://127.0.0.1:8000

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

## Development

Both applications can run simultaneously:

1. Start the backend server on port 8000
2. Start the frontend server on port 3000
3. Frontend will communicate with backend via API calls

## Testing

### Frontend Tests
```bash
cd culturalite-frontend
npm test
npm run test:coverage
```

### Backend Tests
```bash
cd culturalite-backend
python manage.py test tests
```

## Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render
- **Database**: Neon PostgreSQL

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
