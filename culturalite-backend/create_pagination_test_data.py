#!/usr/bin/env python
"""
Script to create additional test data for pagination testing.
Creates 25 more approved events to test pagination (total will be 32 approved events).
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

def create_pagination_test_data():
    """Create additional events for pagination testing."""
    
    # Get existing vendor and categories with error handling
    try:
        vendor = User.objects.get(username='testvendor')
    except User.DoesNotExist:
        print("Error: 'testvendor' user not found. Please create the user first.")
        return

    categories = {}
    required_categories = ['Music', 'Dance', 'Theater', 'Art', 'Festival']

    for category_name in required_categories:
        try:
            categories[category_name] = Category.objects.get(name=category_name)
        except Category.DoesNotExist:
            print(f"Error: '{category_name}' category not found. Please create the category first.")
            return
    
    cities = ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']
    category_list = list(categories.values())
    
    # Create 25 more approved events
    for i in range(25):
        city = cities[i % len(cities)]
        category = category_list[i % len(category_list)]
        
        event = Event.objects.create(
            title=f'Test Event {i+10}',
            description=f'Description for test event {i+10} in {city}',
            city=city,
            event_date=datetime.now(timezone.utc) + timedelta(days=50 + i),
            image_url=f'https://example.com/test{i+10}.jpg',
            status='approved',
            category=category,
            vendor=vendor
        )
        print(f"Created event: {event.title} in {city}")
    
    # Summary
    total_events = Event.objects.count()
    approved_events = Event.objects.filter(status='approved').count()
    
    print(f"\n=== Pagination Test Data Summary ===")
    print(f"Total events: {total_events}")
    print(f"Approved events: {approved_events}")
    print(f"Should have pagination with page size 20: {approved_events > 20}")
    
    return approved_events

if __name__ == '__main__':
    print("Creating additional test data for pagination testing...")
    count = create_pagination_test_data()
    print(f"\nPagination test data creation completed! Total approved events: {count}")
