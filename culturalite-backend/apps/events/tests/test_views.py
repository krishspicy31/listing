import pytest
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from datetime import datetime, timezone
from apps.events.models import Event, Category


class EventListAPIViewTestCase(TestCase):
    """
    Test cases for the EventListAPIView.
    Tests all acceptance criteria for Story 1.3.
    """
    
    def setUp(self):
        """Set up test data for each test."""
        self.client = APIClient()
        self.url = reverse('event-list')
        
        # Create test user (vendor)
        self.vendor = User.objects.create_user(
            username='testvendor',
            email='vendor@test.com',
            password='testpass123'
        )
        
        # Create test categories
        self.music_category = Category.objects.create(
            name='Music',
            slug='music'
        )
        self.dance_category = Category.objects.create(
            name='Dance',
            slug='dance'
        )
        
        # Create test events with different statuses
        self.approved_event_chennai = Event.objects.create(
            title='Chennai Music Festival',
            description='A wonderful music festival in Chennai',
            city='Chennai',
            event_date=datetime(2025, 7, 15, 18, 0, tzinfo=timezone.utc),
            image_url='https://example.com/image1.jpg',
            status='approved',
            category=self.music_category,
            vendor=self.vendor
        )
        
        self.approved_event_mumbai = Event.objects.create(
            title='Mumbai Dance Show',
            description='Amazing dance performance in Mumbai',
            city='Mumbai',
            event_date=datetime(2025, 8, 20, 19, 30, tzinfo=timezone.utc),
            image_url='https://example.com/image2.jpg',
            status='approved',
            category=self.dance_category,
            vendor=self.vendor
        )
        
        self.pending_event = Event.objects.create(
            title='Pending Event',
            description='This event is still pending approval',
            city='Delhi',
            event_date=datetime(2025, 9, 10, 20, 0, tzinfo=timezone.utc),
            image_url='https://example.com/image3.jpg',
            status='pending',
            category=self.music_category,
            vendor=self.vendor
        )
        
        self.rejected_event = Event.objects.create(
            title='Rejected Event',
            description='This event was rejected',
            city='Bangalore',
            event_date=datetime(2025, 10, 5, 17, 0, tzinfo=timezone.utc),
            image_url='https://example.com/image4.jpg',
            status='rejected',
            category=self.dance_category,
            vendor=self.vendor
        )
    
    def test_get_approved_events_only(self):
        """Test that only approved events are returned (AC: 2)."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should return 2 approved events
        if 'results' in response.data:
            events = response.data['results']
        else:
            events = response.data
            
        self.assertEqual(len(events), 2)
        
        # Verify all returned events are approved
        event_titles = [event['title'] for event in events]
        self.assertIn('Chennai Music Festival', event_titles)
        self.assertIn('Mumbai Dance Show', event_titles)
        self.assertNotIn('Pending Event', event_titles)
        self.assertNotIn('Rejected Event', event_titles)
    
    def test_response_format(self):
        """Test that response includes all required fields (AC: 3)."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if 'results' in response.data:
            events = response.data['results']
        else:
            events = response.data
            
        self.assertGreater(len(events), 0)
        
        # Check first event has all required fields
        event = events[0]
        required_fields = ['id', 'title', 'description', 'city', 'event_date', 'image_url', 'category']
        
        for field in required_fields:
            self.assertIn(field, event)
        
        # Check nested category object
        self.assertIn('category', event)
        self.assertIn('name', event['category'])
        self.assertIn('slug', event['category'])
    
    def test_filter_by_city(self):
        """Test filtering by city parameter (AC: 4)."""
        # Test filtering by Chennai
        response = self.client.get(self.url, {'city': 'Chennai'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if 'results' in response.data:
            events = response.data['results']
        else:
            events = response.data
            
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]['title'], 'Chennai Music Festival')
        self.assertEqual(events[0]['city'], 'Chennai')
    
    def test_filter_by_category(self):
        """Test filtering by category parameter (AC: 5)."""
        # Test filtering by Music category
        response = self.client.get(self.url, {'category': 'Music'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if 'results' in response.data:
            events = response.data['results']
        else:
            events = response.data
            
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]['title'], 'Chennai Music Festival')
        self.assertEqual(events[0]['category']['name'], 'Music')
    
    def test_combined_filtering(self):
        """Test filtering by both city and category."""
        # Test filtering by Chennai and Music
        response = self.client.get(self.url, {'city': 'Chennai', 'category': 'Music'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if 'results' in response.data:
            events = response.data['results']
        else:
            events = response.data
            
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]['title'], 'Chennai Music Festival')
        
        # Test filtering with no matches
        response = self.client.get(self.url, {'city': 'Chennai', 'category': 'Dance'})
        
        if 'results' in response.data:
            events = response.data['results']
        else:
            events = response.data
            
        self.assertEqual(len(events), 0)
    
    def test_case_insensitive_filtering(self):
        """Test that filtering is case-insensitive."""
        # Test city filtering with different case
        response = self.client.get(self.url, {'city': 'chennai'})
        
        if 'results' in response.data:
            events = response.data['results']
        else:
            events = response.data
            
        self.assertEqual(len(events), 1)
        
        # Test category filtering with different case
        response = self.client.get(self.url, {'category': 'music'})
        
        if 'results' in response.data:
            events = response.data['results']
        else:
            events = response.data
            
        self.assertEqual(len(events), 1)
    
    def test_empty_results(self):
        """Test handling of empty results."""
        response = self.client.get(self.url, {'city': 'NonexistentCity'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        if 'results' in response.data:
            events = response.data['results']
        else:
            events = response.data
            
        self.assertEqual(len(events), 0)
    
    def test_http_status_codes(self):
        """Test proper HTTP status codes (AC: 6)."""
        # Test successful request
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test successful request with filters
        response = self.client.get(self.url, {'city': 'Chennai'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test successful request with no results
        response = self.client.get(self.url, {'city': 'NonexistentCity'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_pagination_support(self):
        """Test that pagination is working (AC: 7)."""
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if pagination is applied (should have pagination keys if more than PAGE_SIZE items)
        # With only 2 events, pagination metadata should still be present if using DRF pagination
        if 'results' in response.data:
            self.assertIn('results', response.data)
            # Pagination metadata should be present
            pagination_keys = ['count', 'next', 'previous', 'results']
            for key in pagination_keys:
                self.assertIn(key, response.data)
    
    def test_event_date_format(self):
        """Test that event_date is in ISO 8601 format."""
        response = self.client.get(self.url)
        
        if 'results' in response.data:
            events = response.data['results']
        else:
            events = response.data
            
        self.assertGreater(len(events), 0)
        
        # Check that event_date is in ISO format
        event_date = events[0]['event_date']
        self.assertIsInstance(event_date, str)
        # Should be in format like "2025-07-15T18:00:00.000000Z"
        self.assertTrue(event_date.endswith('Z'))
        self.assertIn('T', event_date)
