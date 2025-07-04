#!/usr/bin/env python
"""
Script to test the functionality of Category and Event models.
"""
import os
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Set required environment variables
os.environ.setdefault('SECRET_KEY', 'test-secret-key-for-testing-only')
os.environ.setdefault('DEBUG', 'True')
os.environ.setdefault('USE_POSTGRESQL', 'False')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'culturalite_backend.settings')

django.setup()

from django.contrib.auth.models import User
from apps.events.models import Category, Event

def test_models():
    print("Testing Category and Event models...")
    
    # Create a test user (vendor)
    user, created = User.objects.get_or_create(
        username='testvendor',
        defaults={
            'email': 'vendor@test.com',
            'first_name': 'Test',
            'last_name': 'Vendor'
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"✓ Created test user: {user.username}")
    else:
        print(f"✓ Using existing test user: {user.username}")
    
    # Create test categories
    categories_data = [
        {'name': 'Music'},
        {'name': 'Dance'},
        {'name': 'Theater'},
        {'name': 'Art Exhibition'},
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(**cat_data)
        categories.append(category)
        if created:
            print(f"✓ Created category: {category.name} (slug: {category.slug})")
        else:
            print(f"✓ Using existing category: {category.name} (slug: {category.slug})")
    
    # Create test events
    events_data = [
        {
            'title': 'Jazz Night at Blue Note',
            'description': 'An evening of smooth jazz featuring local artists',
            'city': 'New York',
            'event_date': timezone.now() + timedelta(days=30),
            'image_url': 'https://cloudinary.com/jazz-night.jpg',
            'category': categories[0],  # Music
            'vendor': user,
        },
        {
            'title': 'Contemporary Dance Performance',
            'description': 'Modern dance showcase by emerging choreographers',
            'city': 'Los Angeles',
            'event_date': timezone.now() + timedelta(days=45),
            'image_url': 'https://cloudinary.com/dance-show.jpg',
            'status': 'approved',
            'category': categories[1],  # Dance
            'vendor': user,
        },
        {
            'title': 'Shakespeare in the Park',
            'description': 'Classic theater performance in outdoor setting',
            'city': 'Chicago',
            'event_date': timezone.now() + timedelta(days=60),
            'image_url': 'https://cloudinary.com/shakespeare.jpg',
            'status': 'pending',
            'category': categories[2],  # Theater
            'vendor': user,
        }
    ]
    
    events = []
    for event_data in events_data:
        event, created = Event.objects.get_or_create(
            title=event_data['title'],
            defaults=event_data
        )
        events.append(event)
        if created:
            print(f"✓ Created event: {event.title} - {event.city} ({event.status})")
        else:
            print(f"✓ Using existing event: {event.title} - {event.city} ({event.status})")
    
    # Test relationships
    print("\n--- Testing Relationships ---")
    music_category = categories[0]
    print(f"Music category has {music_category.events.count()} events:")
    for event in music_category.events.all():
        print(f"  - {event.title}")
    
    print(f"\nUser {user.username} has {user.events.count()} events:")
    for event in user.events.all():
        print(f"  - {event.title} ({event.status})")
    
    # Test model methods
    print("\n--- Testing Model Methods ---")
    for category in categories:
        print(f"Category str: {str(category)}")
    
    for event in events:
        print(f"Event str: {str(event)}")
    
    print("\n--- Summary ---")
    print(f"Total Categories: {Category.objects.count()}")
    print(f"Total Events: {Event.objects.count()}")
    print(f"Pending Events: {Event.objects.filter(status='pending').count()}")
    print(f"Approved Events: {Event.objects.filter(status='approved').count()}")
    
    print("\n✅ All model functionality tests completed successfully!")

if __name__ == "__main__":
    test_models()
