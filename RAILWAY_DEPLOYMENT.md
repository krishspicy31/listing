# Railway Deployment Guide

This guide explains how to deploy the Culturalite backend to Railway.app.

## Prerequisites

1. [Railway CLI](https://docs.railway.app/develop/cli) installed
2. Railway account
3. GitHub repository connected to Railway

## Quick Deploy

### Option 1: Deploy Button (Recommended)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/django)

### Option 2: Manual Deployment

1. **Connect Repository**
   ```bash
   railway login
   railway link
   ```

2. **Set Environment Variables**
   ```bash
   railway variables set SECRET_KEY="your-secret-key-here"
   railway variables set DEBUG=False
   railway variables set ALLOWED_HOSTS="your-app.railway.app,your-domain.com"
   railway variables set CORS_ALLOWED_ORIGINS="https://your-frontend.vercel.app"
   ```

3. **Add PostgreSQL Database**
   ```bash
   railway add postgresql
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Environment Variables

Set these variables in your Railway dashboard or via CLI:

### Required Variables
```bash
SECRET_KEY=your-django-secret-key
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app,your-domain.com
```

### Database (Auto-configured with Railway PostgreSQL)
```bash
# Railway automatically provides DATABASE_URL
# No manual database configuration needed
```

### CORS Configuration
```bash
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-domain.com
```

### Optional Variables
```bash
RAILWAY_PUBLIC_DOMAIN=your-app.railway.app
```

## Deployment Configuration

The project includes three deployment options:

### 1. Nixpacks (Default)
Uses `nixpacks.toml` for automatic Python environment setup.

### 2. Railway JSON
Uses `railway.json` for Railway-specific configuration.

### 3. Docker
Uses `Dockerfile.railway` for containerized deployment.

## Build Process

Railway will automatically:

1. **Install Dependencies**: `pip install -r requirements.txt`
2. **Collect Static Files**: `python manage.py collectstatic --noinput`
3. **Run Migrations**: `python manage.py migrate`
4. **Start Server**: `gunicorn culturalite_backend.wsgi:application`

## Health Checks

The backend includes a health check endpoint at `/api/health/` that Railway uses to monitor the service.

## Database Setup

### Automatic (Recommended)
Railway PostgreSQL addon automatically configures the database via `DATABASE_URL`.

### Manual Configuration
If using external database, set these variables:
```bash
USE_POSTGRESQL=True
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
DB_SSLMODE=require
```

## Custom Domain

1. **Add Domain in Railway Dashboard**
2. **Update Environment Variables**
   ```bash
   railway variables set ALLOWED_HOSTS="your-domain.com,your-app.railway.app"
   railway variables set CORS_ALLOWED_ORIGINS="https://your-frontend-domain.com"
   ```

## Monitoring

- **Logs**: `railway logs`
- **Status**: Check Railway dashboard
- **Health**: Visit `https://your-app.railway.app/api/health/`

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Python version compatibility
   - Verify all dependencies in `requirements.txt`

2. **Database Connection Issues**
   - Ensure PostgreSQL addon is added
   - Check `DATABASE_URL` is set

3. **Static Files Not Loading**
   - Verify `collectstatic` runs during build
   - Check `STATIC_ROOT` configuration

4. **CORS Errors**
   - Update `CORS_ALLOWED_ORIGINS` with your frontend URL
   - Ensure HTTPS is used in production

### Debug Commands
```bash
# View logs
railway logs

# Check environment variables
railway variables

# Connect to database
railway connect postgresql

# Run Django commands
railway run python manage.py shell
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

## Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Configure proper `SECRET_KEY`
- [ ] Set correct `ALLOWED_HOSTS`
- [ ] Configure `CORS_ALLOWED_ORIGINS`
- [ ] Add PostgreSQL database
- [ ] Run initial migrations
- [ ] Create superuser account
- [ ] Test health check endpoint
- [ ] Verify frontend can connect to API

## Cost Optimization

- Use Railway's free tier for development
- Monitor usage in Railway dashboard
- Consider scaling options for production load

## Security Notes

- Never commit `.env` files with production secrets
- Use Railway's environment variables for all sensitive data
- Enable HTTPS (automatic with Railway)
- Configure proper CORS settings
- Set secure headers (already configured in settings.py)
