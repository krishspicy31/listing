# Culturalite Frontend

A Next.js 14 frontend application for the Culturalite platform - connecting people with cultural events and experiences.

## Tech Stack

- **Framework**: Next.js 14.2 with App Router
- **Language**: TypeScript 5.4
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: shadcn/ui 0.8.0
- **State Management**: React Context API
- **Testing**: Jest & React Testing Library
- **Linting**: ESLint with Next.js config

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment template:
   ```bash
   cp .env.local.template .env.local
   ```

4. Update environment variables in `.env.local`

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Building

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── shared/             # App-wide components
│   └── ui/                 # shadcn/ui components
├── features/               # Feature-specific logic
├── lib/                    # Helper functions
└── styles/                 # Global styles
```

## Deployment

This project is configured for deployment on Vercel. The deployment will automatically trigger on pushes to the main branch.

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL for development
- `NEXT_PUBLIC_API_URL_PROD`: Backend API URL for production
