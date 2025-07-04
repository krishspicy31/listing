# Render Deployment Guide

This guide will help you deploy the Culturalite application on Render using the Turborepo monorepo setup.

## Prerequisites

- GitHub repository with your code
- Render account (free tier available)

## Deployment Options

### Option 1: Automatic Deployment with render.yaml (Recommended)

1. **Push the `render.yaml` file** to your repository
2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing your code
3. **Render will automatically:**
   - Create frontend service (Node.js)
   - Create backend service (Python)
   - Create PostgreSQL database
   - Set up environment variables
   - Configure domains

### Option 2: Manual Service Creation

#### Frontend Service

1. **Create Web Service:**
   - Environment: `Node`
   - Build Command: `npm install --ignore-scripts && npm run setup:backend && npm run build:frontend` (uses Turborepo)
   - Start Command: `npm run start:frontend` (uses Turborepo)

2. **Environment Variables:**
   ```
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```

#### Backend Service

1. **Create Web Service:**
   - Environment: `Python 3`
   - Build Command: `npm install && npm run build:backend` (uses Turborepo)
   - Start Command: `npm run start:backend` (uses Turborepo)

2. **Environment Variables:**
   ```
   PYTHON_VERSION=3.12.0
   DJANGO_SETTINGS_MODULE=culturalite_backend.settings
   SECRET_KEY=your-secret-key-here (or use "Generate Value" in Render)
   DEBUG=False
   ALLOWED_HOSTS=your-backend-url.onrender.com,localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.onrender.com,http://localhost:3000
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

   **Important**: Set the `SECRET_KEY` environment variable in Render before deploying. You can use Render's "Generate Value" feature for this.

#### Database

1. **Create PostgreSQL Database:**
   - Database Name: `culturalite`
   - User: `culturalite_user`
   - Plan: Free

## Configuration Details

### Automatic Dependency Installation

The `npm install` command automatically installs both Node.js and Python dependencies via the `postinstall` script, making deployment seamless.

### Build Process

1. **Frontend Build:**
   - Installs all dependencies
   - Builds only the frontend using Turborepo filtering
   - Optimizes for production

2. **Backend Build:**
   - Installs Python dependencies
   - Runs database migrations
   - Collects static files
   - Starts with Gunicorn

### Environment Configuration

The application uses environment variables for configuration:

- **Development**: Uses `.env` files
- **Production**: Uses Render environment variables

### CORS Configuration

The backend is configured to accept requests from:
- Frontend production URL
- Localhost (for development)

## Troubleshooting

### Common Issues

1. **SECRET_KEY Error During Build:**
   ```
   UndefinedValueError: SECRET_KEY not found
   ```
   **Solution**: The settings.py now includes a fallback SECRET_KEY for build time. If you still see this error, ensure you're using the updated settings.py file.

2. **STATIC_ROOT Error During Build:**
   ```
   ImproperlyConfigured: You're using the staticfiles app without having set the STATIC_ROOT setting
   ```
   **Solution**: The settings.py now includes proper STATIC_ROOT configuration. Ensure you're using the updated settings.py file.

3. **Playwright Installation Error:**
   ```
   sh: 1: playwright: not found
   ```
   **Solution**: The build command uses `--ignore-scripts` to prevent Playwright from installing during frontend builds. E2E tests should be set up separately.

4. **Build Failures:**
   - Check that all dependencies are listed in requirements.txt (including `dj-database-url`)
   - Verify Python version compatibility
   - Ensure environment variables are set

2. **Database Connection:**
   - Verify DATABASE_URL is correctly set
   - Check that migrations have run
   - Ensure database service is running

3. **CORS Errors:**
   - Verify CORS_ALLOWED_ORIGINS includes frontend URL
   - Check that frontend is using correct API URL

### Logs

Access logs in Render dashboard:
- **Frontend**: Check build and runtime logs
- **Backend**: Check Django application logs
- **Database**: Check connection logs

## Scaling

### Free Tier Limitations

- Services sleep after 15 minutes of inactivity
- 750 hours per month per service
- Limited CPU and memory

### Paid Plans

- Always-on services
- More CPU and memory
- Custom domains
- SSL certificates

## Monitoring

Render provides:
- Service health monitoring
- Performance metrics
- Log aggregation
- Alerting (paid plans)

## Security

### Best Practices

1. **Environment Variables:**
   - Never commit secrets to repository
   - Use Render's environment variable management
   - Rotate secrets regularly

2. **Database:**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups (paid plans)

3. **Application:**
   - Keep dependencies updated
   - Use HTTPS only
   - Implement proper authentication

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [Django Deployment Guide](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
