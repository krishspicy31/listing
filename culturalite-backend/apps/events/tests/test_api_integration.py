import pytest
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from datetime import datetime, timezone
from apps.events.models import Event, Category
import uuid


class EventAPIIntegrationTestCase(TestCase):
    """
    Integration tests for the Events API.
    Tests full API functionality including database queries and response format compliance.
    """
    
    def setUp(self):
        """Set up test data for integration tests."""
        self.client = APIClient()
        self.url = reverse('event-list')

        # Create test vendor with unique username
        unique_id = str(uuid.uuid4())[:8]
        self.vendor = User.objects.create_user(
            username=f'integrationvendor_{unique_id}',
            email=f'integration_{unique_id}@test.com',
            password='testpass123'
        )
        
        # Create multiple categories
        self.categories = []
        category_names = ['Music', 'Dance', 'Theater', 'Art', 'Festival']
        for name in category_names:
            category = Category.objects.create(name=name, slug=name.lower())
            self.categories.append(category)
        
        # Create multiple events across different cities and categories
        self.events_data = [
            {
                'title': 'Chennai Classical Music Concert',
                'city': 'Chennai',
                'category': self.categories[0],  # Music
                'status': 'approved'
            },
            {
                'title': 'Mumbai Bollywood Dance Workshop',
                'city': 'Mumbai', 
                'category': self.categories[1],  # Dance
                'status': 'approved'
            },
            {
                'title': 'Delhi Theater Festival',
                'city': 'Delhi',
                'category': self.categories[2],  # Theater
                'status': 'approved'
            },
            {
                'title': 'Bangalore Art Exhibition',
                'city': 'Bangalore',
                'category': self.categories[3],  # Art
                'status': 'pending'  # Should not appear in results
            },
            {
                'title': 'Kolkata Cultural Festival',
                'city': 'Kolkata',
                'category': self.categories[4],  # Festival
                'status': 'rejected'  # Should not appear in results
            },
            {
                'title': 'Chennai Dance Performance',
                'city': 'Chennai',
                'category': self.categories[1],  # Dance
                'status': 'approved'
            }
        ]
        
        # Create events in database
        self.created_events = []
        for i, event_data in enumerate(self.events_data):
            event = Event.objects.create(
                title=event_data['title'],
                description=f'Description for {event_data["title"]}',
                city=event_data['city'],
                event_date=datetime(2025, 7 + i, 15, 18, 0, tzinfo=timezone.utc),
                image_url=f'https://example.com/image{i+1}.jpg',
                status=event_data['status'],
                category=event_data['category'],
                vendor=self.vendor
            )
            self.created_events.append(event)
    
    def test_full_api_functionality(self):
        """Test complete API functionality with real database queries."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        
        # Should return only approved events (4 out of 6)
        approved_events = response.data['results']
        self.assertEqual(len(approved_events), 4)
        
        # Verify all events are approved
        for event in approved_events:
            # Find corresponding event in database
            db_event = Event.objects.get(id=event['id'])
            self.assertEqual(db_event.status, 'approved')
    
    def test_database_query_optimization(self):
        """Test that database queries are optimized (select_related)."""
        # This test ensures we're not making N+1 queries
        with self.assertNumQueries(2):  # 1 for events + 1 for count (pagination)
            response = self.client.get(self.url)
            
            # Access category data to ensure it's prefetched
            if 'results' in response.data:
                for event in response.data['results']:
                    self.assertIn('category', event)
                    self.assertIn('name', event['category'])
    
    def test_city_filtering_integration(self):
        """Test city filtering with real database queries."""
        # Test Chennai events
        response = self.client.get(self.url, {'city': 'Chennai'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        chennai_events = response.data['results']
        
        # Should return 2 approved Chennai events
        self.assertEqual(len(chennai_events), 2)
        
        for event in chennai_events:
            self.assertEqual(event['city'], 'Chennai')
            # Verify in database
            db_event = Event.objects.get(id=event['id'])
            self.assertEqual(db_event.city, 'Chennai')
            self.assertEqual(db_event.status, 'approved')
    
    def test_category_filtering_integration(self):
        """Test category filtering with real database queries."""
        # Test Music category events
        response = self.client.get(self.url, {'category': 'Music'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        music_events = response.data['results']
        
        # Should return 1 approved Music event
        self.assertEqual(len(music_events), 1)
        self.assertEqual(music_events[0]['category']['name'], 'Music')
        
        # Verify in database
        db_event = Event.objects.get(id=music_events[0]['id'])
        self.assertEqual(db_event.category.name, 'Music')
        self.assertEqual(db_event.status, 'approved')
    
    def test_combined_filtering_integration(self):
        """Test combined city and category filtering."""
        # Test Chennai + Dance combination
        response = self.client.get(self.url, {'city': 'Chennai', 'category': 'Dance'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        filtered_events = response.data['results']
        
        # Should return 1 event (Chennai Dance Performance)
        self.assertEqual(len(filtered_events), 1)
        self.assertEqual(filtered_events[0]['city'], 'Chennai')
        self.assertEqual(filtered_events[0]['category']['name'], 'Dance')
    
    def test_response_format_compliance(self):
        """Test that response format matches API specification exactly."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check pagination structure
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        
        # Check event structure
        events = response.data['results']
        self.assertGreater(len(events), 0)
        
        for event in events:
            # Required fields from AC #3
            required_fields = ['id', 'title', 'description', 'city', 'event_date', 'image_url', 'category']
            for field in required_fields:
                self.assertIn(field, event, f"Missing required field: {field}")
            
            # Check category nested object
            category = event['category']
            self.assertIn('name', category)
            self.assertIn('slug', category)
            
            # Check data types
            self.assertIsInstance(event['id'], int)
            self.assertIsInstance(event['title'], str)
            self.assertIsInstance(event['description'], str)
            self.assertIsInstance(event['city'], str)
            self.assertIsInstance(event['event_date'], str)
            self.assertIsInstance(event['image_url'], str)
            self.assertIsInstance(category['name'], str)
            self.assertIsInstance(category['slug'], str)
    
    def test_pagination_functionality(self):
        """Test pagination with larger dataset."""
        # Create more events to test pagination
        for i in range(25):  # Create 25 more approved events
            Event.objects.create(
                title=f'Test Event {i+10}',
                description=f'Description for test event {i+10}',
                city='TestCity',
                event_date=datetime(2025, 8, i+1, 18, 0, tzinfo=timezone.utc),
                image_url=f'https://example.com/test{i+10}.jpg',
                status='approved',
                category=self.categories[0],
                vendor=self.vendor
            )
        
        # Test first page
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        
        # Should return PAGE_SIZE items (20 by default)
        self.assertEqual(len(response.data['results']), 20)
        
        # Should have next page
        self.assertIsNotNone(response.data['next'])
        self.assertIsNone(response.data['previous'])
        
        # Test second page
        response = self.client.get(self.url, {'page': 2})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should have remaining events (29 total approved - 20 on first page = 9)
        self.assertEqual(len(response.data['results']), 9)
        
        # Should have previous page, no next page
        self.assertIsNone(response.data['next'])
        self.assertIsNotNone(response.data['previous'])
    
    def test_ordering_by_event_date(self):
        """Test that events are ordered by event_date descending."""
        response = self.client.get(self.url)
        
        events = response.data['results']
        self.assertGreater(len(events), 1)
        
        # Check that events are ordered by event_date descending
        for i in range(len(events) - 1):
            current_date = events[i]['event_date']
            next_date = events[i + 1]['event_date']
            
            # Convert to datetime for comparison
            current_dt = datetime.fromisoformat(current_date.replace('Z', '+00:00'))
            next_dt = datetime.fromisoformat(next_date.replace('Z', '+00:00'))
            
            self.assertGreaterEqual(current_dt, next_dt, 
                                  "Events should be ordered by event_date descending")
    
    def test_invalid_parameters(self):
        """Test handling of invalid query parameters."""
        # Test with empty parameters
        response = self.client.get(self.url, {'city': '', 'category': ''})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test with special characters
        response = self.client.get(self.url, {'city': 'Test@City!', 'category': 'Test#Category'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should return empty results for non-existent values
        self.assertEqual(len(response.data['results']), 0)
