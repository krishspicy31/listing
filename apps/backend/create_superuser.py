#!/usr/bin/env python
"""
Script to create a superuser for testing Django admin functionality.
"""
import os
import django

# Set required environment variables
os.environ.setdefault('SECRET_KEY', 'test-secret-key-for-testing-only')
os.environ.setdefault('DEBUG', 'True')
os.environ.setdefault('USE_POSTGRESQL', 'False')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'culturalite_backend.settings')

django.setup()

from django.contrib.auth.models import User

# Create superuser if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
    print("Superuser 'admin' created successfully!")
else:
    print("Superuser 'admin' already exists.")
