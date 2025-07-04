import os
from .settings import *

# Override settings for Vercel deployment
DEBUG = False

# Vercel provides these environment variables
SECRET_KEY = os.environ.get('SECRET_KEY', 'vercel-deployment-key-change-in-production')

# Allow Vercel domains
ALLOWED_HOSTS = [
    '.vercel.app',
    '.now.sh',
    'localhost',
    '127.0.0.1',
    '*'  # Remove this in production and specify your domain
]

# Database configuration for Vercel
# Use SQLite for simplicity, or configure PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/tmp/db.sqlite3',  # Vercel tmp directory
    }
}

# Static files configuration for Vercel
STATIC_URL = '/static/'
STATIC_ROOT = '/tmp/staticfiles'

# CORS settings for frontend-backend communication
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://localhost:3000",
]

# Allow all origins in development (remove in production)
CORS_ALLOW_ALL_ORIGINS = True

# Security settings for production
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
