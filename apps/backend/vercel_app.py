import os
import sys
import django
from django.core.wsgi import get_wsgi_application

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the Django settings module for Vercel
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'culturalite_backend.vercel_settings')

# Setup Django
django.setup()

# Get the WSGI application
application = get_wsgi_application()

# Vercel handler
app = application
