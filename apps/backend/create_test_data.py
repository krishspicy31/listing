#!/usr/bin/env python
"""
Script to create test data for Events API testing.
This script creates events with different statuses and categories for comprehensive testing.
"""
import os
import sys
import django
from datetime import datetime, timezone, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'culturalite_backend.settings')
django.setup()

from django.contrib.auth.models import User
from apps.events.models import Event, Category
from django.db import IntegrityError

def create_test_data():
    """Create comprehensive test data for API testing."""
    
    # Create or get test vendor
    vendor, created = User.objects.get_or_create(
        username='testvendor',
        defaults={
            'email': 'vendor@test.com',
            'first_name': 'Test',
            'last_name': 'Vendor'
        }
    )
    if created:
        vendor.set_password('testpass123')
        vendor.save()
        print(f"Created vendor: {vendor.username}")
    else:
        print(f"Using existing vendor: {vendor.username}")
    
    # Create categories
    categories_data = [
        {'name': 'Music', 'slug': 'music'},
        {'name': 'Dance', 'slug': 'dance'},
        {'name': 'Theater', 'slug': 'theater'},
        {'name': 'Art', 'slug': 'art'},
        {'name': 'Festival', 'slug': 'festival'},
    ]
    
    categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'slug': cat_data['slug']}
        )
        categories[cat_data['name']] = category
        if created:
            print(f"Created category: {category.name}")
        else:
            print(f"Using existing category: {category.name}")
    
    # Create test events with different statuses and locations
    events_data = [
        {
            'title': 'Chennai Classical Music Concert',
            'description': 'Traditional South Indian classical music performance',
            'city': 'Chennai',
            'category': categories['Music'],
            'status': 'approved',
            'days_offset': 30
        },
        {
            'title': 'Mumbai Bollywood Dance Workshop',
            'description': 'Learn Bollywood dance moves from professional choreographers',
            'city': 'Mumbai',
            'category': categories['Dance'],
            'status': 'approved',
            'days_offset': 25
        },
        {
            'title': 'Delhi Theater Festival',
            'description': 'Annual theater festival featuring plays from across India',
            'city': 'Delhi',
            'category': categories['Theater'],
            'status': 'approved',
            'days_offset': 20
        },
        {
            'title': 'Chennai Dance Performance',
            'description': 'Traditional Tamil dance performance',
            'city': 'Chennai',
            'category': categories['Dance'],
            'status': 'approved',
            'days_offset': 15
        },
        {
            'title': 'Bangalore Art Exhibition',
            'description': 'Contemporary art exhibition by local artists',
            'city': 'Bangalore',
            'category': categories['Art'],
            'status': 'pending',  # Should NOT appear in API
            'days_offset': 10
        },
        {
            'title': 'Kolkata Cultural Festival',
            'description': 'Multi-day cultural festival celebrating Bengali heritage',
            'city': 'Kolkata',
            'category': categories['Festival'],
            'status': 'rejected',  # Should NOT appear in API
            'days_offset': 5
        },
        {
            'title': 'Mumbai Music Night',
            'description': 'Evening of fusion music blending traditional and modern styles',
            'city': 'Mumbai',
            'category': categories['Music'],
            'status': 'approved',
            'days_offset': 35
        },
        {
            'title': 'Chennai Art Workshop',
            'description': 'Hands-on art workshop for beginners and professionals',
            'city': 'Chennai',
            'category': categories['Art'],
            'status': 'approved',
            'days_offset': 40
        }
    ]
    
    created_events = []
    for i, event_data in enumerate(events_data):
        # Check if event already exists
        existing_event = Event.objects.filter(title=event_data['title']).first()
        if existing_event:
            print(f"Event already exists: {event_data['title']}")
            created_events.append(existing_event)
            continue
            
        try:
            event = Event.objects.create(
                title=event_data['title'],
                description=event_data['description'],
                city=event_data['city'],
                event_date=datetime.now(timezone.utc) + timedelta(days=event_data['days_offset']),
                image_url=f'https://example.com/image{i+1}.jpg',
                status=event_data['status'],
                category=event_data['category'],
                vendor=vendor
            )
            created_events.append(event)
            print(f"Created event: {event.title} ({event.status})")
        except IntegrityError as e:
            print(f"Error creating event '{event_data['title']}': {str(e)}")
            continue
        except Exception as e:
            print(f"Unexpected error creating event '{event_data['title']}': {str(e)}")
            continue
    
    # Summary
    total_events = Event.objects.count()
    approved_events = Event.objects.filter(status='approved').count()
    pending_events = Event.objects.filter(status='pending').count()
    rejected_events = Event.objects.filter(status='rejected').count()
    
    print(f"\n=== Test Data Summary ===")
    print(f"Total events: {total_events}")
    print(f"Approved events: {approved_events}")
    print(f"Pending events: {pending_events}")
    print(f"Rejected events: {rejected_events}")
    print(f"Categories: {len(categories)}")
    
    return created_events

if __name__ == '__main__':
    print("Creating test data for Events API testing...")
    events = create_test_data()
    print(f"\nTest data creation completed!")
