"""
Test script to verify Vercel deployment configuration
"""
import os
import django
from django.conf import settings
from django.test import TestCase
from django.urls import reverse

# Test the Vercel settings
def test_vercel_settings():
    """Test that Vercel settings are configured correctly"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'culturalite_backend.vercel_settings')
    django.setup()
    
    print("✅ Django settings loaded successfully")
    print(f"DEBUG: {settings.DEBUG}")
    print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
    print(f"DATABASE: {settings.DATABASES['default']['ENGINE']}")
    print(f"STATIC_URL: {settings.STATIC_URL}")
    print(f"STATIC_ROOT: {settings.STATIC_ROOT}")
    
    return True

if __name__ == "__main__":
    test_vercel_settings()
