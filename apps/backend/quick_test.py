import os
import django

os.environ.setdefault('SECRET_KEY', 'test-secret-key')
os.environ.setdefault('DEBUG', 'True')
os.environ.setdefault('USE_POSTGRESQL', 'False')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'culturalite_backend.settings')

django.setup()

from apps.events.models import Category, Event
from django.contrib.auth.models import User

# Quick test
print("Testing models...")
cat = Category.objects.create(name="Test Music")
print(f"Created category: {cat}")
print(f"Category slug: {cat.slug}")
print("✅ Models working correctly!")
