# Deployment Guide

This guide covers deploying the Culturalite full-stack application on Vercel.

## Full-Stack Vercel Deployment

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare your production secrets

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the Turborepo setup

### Step 2: Configure Environment Variables

In the Vercel dashboard, add these environment variables:

```bash
# Required
SECRET_KEY=your-django-secret-key-here

# Optional
DEBUG=False
ALLOWED_HOSTS=your-app.vercel.app,your-custom-domain.com
DATABASE_URL=postgresql://user:pass@host:port/db  # If using PostgreSQL
```

### Step 3: Deploy

1. Click "Deploy" in Vercel
2. Vercel will:
   - Install Node.js dependencies (`npm install`)
   - Install Python dependencies (via `postinstall`)
   - Build frontend (`turbo build`)
   - Build backend (Django static files)
   - Deploy both applications

### Step 4: Verify Deployment

After deployment, test these URLs:

- **Frontend**: `https://your-app.vercel.app/`
- **Backend API**: `https://your-app.vercel.app/api/`
- **Django Admin**: `https://your-app.vercel.app/api/admin/`

## Architecture

### Request Routing

```
https://your-app.vercel.app/
├── /                    → Next.js Frontend
├── /about              → Next.js Frontend  
├── /dashboard          → Next.js Frontend
└── /api/
    ├── /api/events/    → Django Backend
    ├── /api/users/     → Django Backend
    └── /api/admin/     → Django Admin
```

### File Structure

```
vercel-deployment/
├── apps/
│   ├── frontend/           # Next.js app
│   └── backend/
│       ├── vercel_app.py   # WSGI entry point
│       └── culturalite_backend/
│           └── vercel_settings.py  # Production settings
├── vercel.json            # Deployment config
└── requirements.txt       # Python dependencies
```

## Configuration Details

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/frontend/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/backend/vercel_app.py", 
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/backend/vercel_app.py"
    },
    {
      "src": "/(.*)",
      "dest": "apps/frontend/$1"
    }
  ]
}
```

### Django Settings

The `vercel_settings.py` file configures Django for Vercel:

- Uses SQLite with `/tmp/` directory (Vercel temporary storage)
- Configures static files for serverless environment
- Sets up CORS for frontend-backend communication
- Enables production security settings

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set
   - Verify Python dependencies in `requirements.txt`
   - Check build logs in Vercel dashboard

2. **API Not Working**
   - Verify `/api/` routes are configured correctly
   - Check Django settings and CORS configuration
   - Test API endpoints directly

3. **Static Files Issues**
   - Ensure `collectstatic` runs during build
   - Check `STATIC_ROOT` configuration
   - Verify static file serving in production

### Debug Commands

```bash
# Test locally
npm run dev

# Build locally
npm run build

# Test backend only
cd apps/backend
python manage.py runserver --settings=culturalite_backend.vercel_settings

# Test frontend only
cd apps/frontend
npm run build && npm start
```

## Production Considerations

### Database

For production, consider upgrading from SQLite:

1. **PostgreSQL** (Recommended)
   - Neon, Supabase, or PlanetScale
   - Update `vercel_settings.py` with database URL

2. **Environment Variables**
   ```bash
   DATABASE_URL=postgresql://user:pass@host:port/dbname
   ```

### Security

1. **Secret Key**: Use a strong, unique secret key
2. **Allowed Hosts**: Specify your exact domains
3. **CORS**: Configure specific origins instead of allowing all
4. **HTTPS**: Vercel provides HTTPS by default

### Monitoring

1. **Vercel Analytics**: Enable in dashboard
2. **Django Logging**: Configure in `vercel_settings.py`
3. **Error Tracking**: Consider Sentry integration

## Alternative Deployment Options

### Frontend Only on Vercel

Update `vercel.json`:
```json
{
  "buildCommand": "turbo build --filter=frontend",
  "outputDirectory": "apps/frontend/.next"
}
```

### Backend on Railway/Render

Deploy backend separately using:
```bash
npm run build:production --workspace=backend
```

This gives you more control over backend scaling and database management.
