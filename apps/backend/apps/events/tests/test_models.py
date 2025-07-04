from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone
from datetime import datetime, timedelta
from apps.events.models import Category, Event


class CategoryModelTest(TestCase):
    """Test cases for the Category model."""

    def setUp(self):
        """Set up test data."""
        self.category_data = {
            'name': 'Music',
        }

    def test_category_creation(self):
        """Test creating a category with valid data."""
        category = Category.objects.create(**self.category_data)
        self.assertEqual(category.name, 'Music')
        self.assertEqual(category.slug, 'music')  # Auto-generated slug
        self.assertTrue(category.id)

    def test_category_str_representation(self):
        """Test the string representation of a category."""
        category = Category.objects.create(**self.category_data)
        self.assertEqual(str(category), 'Music')

    def test_category_slug_auto_generation(self):
        """Test that slug is auto-generated from name."""
        category = Category.objects.create(name='Dance & Performance')
        self.assertEqual(category.slug, 'dance-performance')

    def test_category_slug_manual_override(self):
        """Test that manually provided slug is preserved."""
        category = Category.objects.create(name='Music', slug='custom-music')
        self.assertEqual(category.slug, 'custom-music')

    def test_category_name_unique_constraint(self):
        """Test that category names must be unique."""
        Category.objects.create(**self.category_data)
        with self.assertRaises(IntegrityError):
            Category.objects.create(**self.category_data)

    def test_category_slug_unique_constraint(self):
        """Test that category slugs must be unique."""
        Category.objects.create(name='Music', slug='music')
        with self.assertRaises(IntegrityError):
            Category.objects.create(name='Different Name', slug='music')

    def test_category_name_max_length(self):
        """Test category name max length constraint."""
        long_name = 'x' * 101  # Exceeds max_length=100
        category = Category(name=long_name)
        with self.assertRaises(ValidationError):
            category.full_clean()

    def test_category_ordering(self):
        """Test that categories are ordered by name."""
        Category.objects.create(name='Zebra')
        Category.objects.create(name='Alpha')
        Category.objects.create(name='Beta')
        
        categories = list(Category.objects.all())
        names = [cat.name for cat in categories]
        self.assertEqual(names, ['Alpha', 'Beta', 'Zebra'])

    def test_category_verbose_names(self):
        """Test category model verbose names."""
        self.assertEqual(Category._meta.verbose_name, 'Category')
        self.assertEqual(Category._meta.verbose_name_plural, 'Categories')


class EventModelTest(TestCase):
    """Test cases for the Event model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testvendor',
            email='vendor@test.com',
            password='testpass123'
        )
        self.category = Category.objects.create(name='Music')
        
        self.event_data = {
            'title': 'Jazz Night',
            'description': 'An evening of smooth jazz music',
            'city': 'New York',
            'event_date': timezone.now() + timedelta(days=30),
            'image_url': 'https://cloudinary.com/image123.jpg',
            'category': self.category,
            'vendor': self.user,
        }

    def test_event_creation(self):
        """Test creating an event with valid data."""
        event = Event.objects.create(**self.event_data)
        self.assertEqual(event.title, 'Jazz Night')
        self.assertEqual(event.description, 'An evening of smooth jazz music')
        self.assertEqual(event.city, 'New York')
        self.assertEqual(event.status, 'pending')  # Default status
        self.assertEqual(event.category, self.category)
        self.assertEqual(event.vendor, self.user)
        self.assertTrue(event.id)

    def test_event_str_representation(self):
        """Test the string representation of an event."""
        event = Event.objects.create(**self.event_data)
        expected_str = f"Jazz Night - New York ({event.event_date.strftime('%Y-%m-%d')})"
        self.assertEqual(str(event), expected_str)

    def test_event_default_status(self):
        """Test that event status defaults to 'pending'."""
        event = Event.objects.create(**self.event_data)
        self.assertEqual(event.status, 'pending')

    def test_event_status_choices(self):
        """Test all valid status choices."""
        valid_statuses = ['pending', 'approved', 'rejected']
        
        for status in valid_statuses:
            event_data = self.event_data.copy()
            event_data['status'] = status
            event_data['title'] = f'Event {status}'
            event = Event.objects.create(**event_data)
            self.assertEqual(event.status, status)

    def test_event_category_relationship(self):
        """Test the foreign key relationship with Category."""
        event = Event.objects.create(**self.event_data)
        self.assertEqual(event.category, self.category)
        self.assertIn(event, self.category.events.all())

    def test_event_vendor_relationship(self):
        """Test the foreign key relationship with User (vendor)."""
        event = Event.objects.create(**self.event_data)
        self.assertEqual(event.vendor, self.user)
        self.assertIn(event, self.user.events.all())

    def test_event_cascade_delete_category(self):
        """Test that deleting a category deletes associated events."""
        event = Event.objects.create(**self.event_data)
        event_id = event.id
        
        self.category.delete()
        
        with self.assertRaises(Event.DoesNotExist):
            Event.objects.get(id=event_id)

    def test_event_cascade_delete_vendor(self):
        """Test that deleting a vendor deletes associated events."""
        event = Event.objects.create(**self.event_data)
        event_id = event.id
        
        self.user.delete()
        
        with self.assertRaises(Event.DoesNotExist):
            Event.objects.get(id=event_id)

    def test_event_title_max_length(self):
        """Test event title max length constraint."""
        long_title = 'x' * 201  # Exceeds max_length=200
        event_data = self.event_data.copy()
        event_data['title'] = long_title
        event = Event(**event_data)
        with self.assertRaises(ValidationError):
            event.full_clean()

    def test_event_city_max_length(self):
        """Test event city max length constraint."""
        long_city = 'x' * 101  # Exceeds max_length=100
        event_data = self.event_data.copy()
        event_data['city'] = long_city
        event = Event(**event_data)
        with self.assertRaises(ValidationError):
            event.full_clean()

    def test_event_image_url_max_length(self):
        """Test event image_url max length constraint."""
        long_url = 'https://example.com/' + 'x' * 250  # Exceeds max_length=255
        event_data = self.event_data.copy()
        event_data['image_url'] = long_url
        event = Event(**event_data)
        with self.assertRaises(ValidationError):
            event.full_clean()

    def test_event_ordering(self):
        """Test that events are ordered by event_date descending."""
        # Create events with different dates
        future_date = timezone.now() + timedelta(days=30)
        far_future_date = timezone.now() + timedelta(days=60)
        near_future_date = timezone.now() + timedelta(days=15)
        
        event1 = Event.objects.create(
            **{**self.event_data, 'title': 'Event 1', 'event_date': future_date}
        )
        event2 = Event.objects.create(
            **{**self.event_data, 'title': 'Event 2', 'event_date': far_future_date}
        )
        event3 = Event.objects.create(
            **{**self.event_data, 'title': 'Event 3', 'event_date': near_future_date}
        )
        
        events = list(Event.objects.all())
        # Should be ordered by event_date descending (most recent first)
        self.assertEqual(events[0], event2)  # Far future (latest)
        self.assertEqual(events[1], event1)  # Future
        self.assertEqual(events[2], event3)  # Near future (earliest)

    def test_event_verbose_names(self):
        """Test event model verbose names."""
        self.assertEqual(Event._meta.verbose_name, 'Event')
        self.assertEqual(Event._meta.verbose_name_plural, 'Events')

    def test_event_required_fields(self):
        """Test that all required fields are enforced."""
        required_fields = ['title', 'description', 'city', 'event_date', 'image_url', 'category', 'vendor']
        
        for field in required_fields:
            event_data = self.event_data.copy()
            del event_data[field]
            
            with self.assertRaises((ValidationError, IntegrityError, ValueError)):
                event = Event(**event_data)
                event.full_clean()
                event.save()


class ModelRelationshipTest(TestCase):
    """Test cases for model relationships and interactions."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testvendor',
            email='vendor@test.com',
            password='testpass123'
        )
        self.category = Category.objects.create(name='Music')

    def test_category_events_related_name(self):
        """Test the related_name for category events."""
        event1 = Event.objects.create(
            title='Event 1',
            description='Description 1',
            city='City 1',
            event_date=timezone.now() + timedelta(days=1),
            image_url='https://example.com/1.jpg',
            category=self.category,
            vendor=self.user
        )
        event2 = Event.objects.create(
            title='Event 2',
            description='Description 2',
            city='City 2',
            event_date=timezone.now() + timedelta(days=2),
            image_url='https://example.com/2.jpg',
            category=self.category,
            vendor=self.user
        )
        
        category_events = self.category.events.all()
        self.assertEqual(category_events.count(), 2)
        self.assertIn(event1, category_events)
        self.assertIn(event2, category_events)

    def test_user_events_related_name(self):
        """Test the related_name for user events."""
        event1 = Event.objects.create(
            title='Event 1',
            description='Description 1',
            city='City 1',
            event_date=timezone.now() + timedelta(days=1),
            image_url='https://example.com/1.jpg',
            category=self.category,
            vendor=self.user
        )
        event2 = Event.objects.create(
            title='Event 2',
            description='Description 2',
            city='City 2',
            event_date=timezone.now() + timedelta(days=2),
            image_url='https://example.com/2.jpg',
            category=self.category,
            vendor=self.user
        )
        
        user_events = self.user.events.all()
        self.assertEqual(user_events.count(), 2)
        self.assertIn(event1, user_events)
        self.assertIn(event2, user_events)
