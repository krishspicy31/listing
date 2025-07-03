"""
Test-specific Django settings for culturalite_backend project.
Inherits from main settings but disables problematic middleware for testing.
"""

from .settings import *
import os

# Override settings for testing environment
DEBUG = True

# Use in-memory SQLite for faster tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable CSRF protection for tests
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',  # Disabled for tests
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Disable rate limiting for tests
RATELIMIT_ENABLE = False
RATELIMIT_VIEW = 'django_ratelimit.views.ratelimited'

# Override rate limiting to be disabled
import django_ratelimit.decorators
original_ratelimit = django_ratelimit.decorators.ratelimit

def disabled_ratelimit(*args, **kwargs):
    """Disabled rate limiting decorator for tests."""
    def decorator(func):
        return func
    return decorator

django_ratelimit.decorators.ratelimit = disabled_ratelimit

# Use dummy cache for tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Faster password hashing for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Disable migrations for faster tests
class DisableMigrations:
    def __contains__(self, item):
        return True
    
    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Test-specific JWT settings for faster token generation
SIMPLE_JWT.update({
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ALGORITHM': 'HS256',
})

# Ensure test environment variables
SECRET_KEY = os.environ.get('SECRET_KEY', 'test-secret-key-for-testing-only')

# Allow all hosts in test environment
ALLOWED_HOSTS = ['*']

# Disable CORS restrictions for tests
CORS_ALLOW_ALL_ORIGINS = True
