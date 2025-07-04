# Culturalite Backend

A Django REST API backend for the Culturalite platform - connecting people with cultural events and experiences.

## Tech Stack

- **Framework**: Django 5.0
- **API**: Django REST Framework 3.15
- **Authentication**: djangorestframework-simplejwt 5.3
- **Database**: PostgreSQL (Neon) / SQLite (development)
- **CORS**: django-cors-headers 4.3
- **Environment**: python-decouple 3.8
- **Testing**: Django TestCase
- **Deployment**: Gunicorn 21.2

## Getting Started

### Prerequisites

- Python 3.12+
- pip

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy environment template:
   ```bash
   cp .env.template .env
   ```

4. Update environment variables in `.env`

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

### Development

Run the development server:

```bash
python manage.py runserver
```

The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000)

### Testing

Run tests:
```bash
python manage.py test tests
```

### API Endpoints

- `GET /api/health/` - Health check endpoint
- `GET /admin/` - Django admin interface
- `GET /api/events/` - Events API (placeholder)
- `GET /api/users/` - Users API (placeholder)
- `GET /api/notifications/` - Notifications API (placeholder)

## Project Structure

```
culturalite_backend/        # Core Django project
├── settings.py             # Project settings
├── urls.py                 # Root URL configuration
└── wsgi.py                 # WSGI entry point

apps/                       # Django apps directory
├── events/                 # Events app
├── users/                  # Users app
└── notifications/          # Notifications app

tests/                      # Test files
├── test_health.py          # Health endpoint tests
└── test_database.py        # Database connectivity tests
```

## Environment Variables

### Security-Critical Variables (Required)

- `SECRET_KEY`: **REQUIRED** - Django secret key (no default for security)
  - Generate with: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
- `DEBUG`: Debug mode (defaults to False for production safety)
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts (update for production domains)

### Database Variables

- `USE_POSTGRESQL`: Use PostgreSQL instead of SQLite (True/False)
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_SSLMODE`: Database SSL mode

### CORS Variables

- `CORS_ALLOWED_ORIGINS`: **REQUIRED** - Comma-separated list of allowed CORS origins (no wildcards)
- `CORS_ALLOWED_ORIGIN_REGEXES`: Optional regex patterns for flexible domain matching (use with caution)

## Security

This project implements Django security best practices:

- **SECRET_KEY**: Must be set via environment variable (no insecure default)
- **DEBUG**: Defaults to False for production safety
- **ALLOWED_HOSTS**: Must be configured with actual domain names for production
- **CORS Security**: Explicitly prevents allowing all origins, requires specific domain configuration
- **Environment Variables**: All sensitive configuration is externalized

⚠️ **Important**: The application will not start without a valid `SECRET_KEY` environment variable.

## Deployment

This project is configured for deployment on Render. The deployment will automatically trigger on pushes to the main branch.

### Production Setup

1. Set `USE_POSTGRESQL=True` in environment variables
2. Configure Neon PostgreSQL database credentials
3. Set appropriate `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
4. Use Gunicorn as WSGI server: `gunicorn culturalite_backend.wsgi:application`
