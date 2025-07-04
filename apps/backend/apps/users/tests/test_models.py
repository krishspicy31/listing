"""
Unit tests for user models.
Tests UserProfile model functionality, relationships, and validation.
"""

import pytest
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from apps.users.models import UserProfile


class UserProfileModelTest(TestCase):
    """Test cases for UserProfile model."""

    def setUp(self):
        """Set up test data."""
        self.user_data = {
            'username': 'testuser@example.com',
            'email': 'testuser@example.com',
            'password': 'TestPass123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
        self.user = User.objects.create_user(**self.user_data)

    def test_create_user_profile(self):
        """Test creating a UserProfile instance."""
        profile = UserProfile.objects.create(
            user=self.user,
            role='vendor',
            organization_name='Test Organization',
            city='Test City',
            country='Test Country'
        )
        
        self.assertEqual(profile.user, self.user)
        self.assertEqual(profile.role, 'vendor')
        self.assertEqual(profile.organization_name, 'Test Organization')
        self.assertEqual(profile.city, 'Test City')
        self.assertEqual(profile.country, 'Test Country')
        self.assertFalse(profile.is_verified)

    def test_user_profile_default_role(self):
        """Test that default role is 'vendor'."""
        profile = UserProfile.objects.create(user=self.user)
        self.assertEqual(profile.role, 'vendor')

    def test_user_profile_role_choices(self):
        """Test that only valid role choices are accepted."""
        # Valid roles
        for role in ['vendor', 'admin']:
            profile = UserProfile.objects.create(
                user=User.objects.create_user(
                    username=f'{role}@example.com',
                    email=f'{role}@example.com',
                    password='TestPass123!'
                ),
                role=role
            )
            self.assertEqual(profile.role, role)

    def test_user_profile_string_representation(self):
        """Test the string representation of UserProfile."""
        profile = UserProfile.objects.create(
            user=self.user,
            role='vendor',
            organization_name='Test Org'
        )
        expected = f"{self.user.get_full_name()} (vendor)"
        self.assertEqual(str(profile), expected)

    def test_user_profile_string_representation_no_name(self):
        """Test string representation when user has no full name."""
        user = User.objects.create_user(
            username='noname@example.com',
            email='noname@example.com',
            password='TestPass123!'
        )
        profile = UserProfile.objects.create(user=user, role='admin')
        expected = f"{user.username} (admin)"
        self.assertEqual(str(profile), expected)

    def test_display_name_property_full_name(self):
        """Test display_name property with full name."""
        profile = UserProfile.objects.create(user=self.user)
        expected = f"{self.user.first_name} {self.user.last_name}"
        self.assertEqual(profile.display_name, expected)

    def test_display_name_property_organization(self):
        """Test display_name property with organization name."""
        user = User.objects.create_user(
            username='org@example.com',
            email='org@example.com',
            password='TestPass123!'
        )
        profile = UserProfile.objects.create(
            user=user,
            organization_name='Test Organization'
        )
        self.assertEqual(profile.display_name, 'Test Organization')

    def test_display_name_property_username_fallback(self):
        """Test display_name property falls back to username."""
        user = User.objects.create_user(
            username='fallback@example.com',
            email='fallback@example.com',
            password='TestPass123!'
        )
        profile = UserProfile.objects.create(user=user)
        self.assertEqual(profile.display_name, user.username)

    def test_user_profile_one_to_one_relationship(self):
        """Test that UserProfile has one-to-one relationship with User."""
        profile = UserProfile.objects.create(user=self.user)
        
        # Test forward relationship
        self.assertEqual(profile.user, self.user)
        
        # Test reverse relationship
        self.assertEqual(self.user.profile, profile)

    def test_user_profile_cascade_delete(self):
        """Test that UserProfile is deleted when User is deleted."""
        profile = UserProfile.objects.create(user=self.user)
        profile_id = profile.id
        
        # Delete user
        self.user.delete()
        
        # Profile should be deleted too
        with self.assertRaises(UserProfile.DoesNotExist):
            UserProfile.objects.get(id=profile_id)

    def test_user_profile_optional_fields(self):
        """Test that optional fields can be blank."""
        profile = UserProfile.objects.create(user=self.user)
        
        # These fields should be blank by default
        self.assertEqual(profile.organization_name, '')
        self.assertEqual(profile.phone_number, '')
        self.assertEqual(profile.website, '')
        self.assertEqual(profile.bio, '')
        self.assertEqual(profile.avatar, '')
        self.assertEqual(profile.city, '')
        self.assertEqual(profile.country, '')

    def test_user_profile_timestamps(self):
        """Test that timestamps are automatically set."""
        profile = UserProfile.objects.create(user=self.user)
        
        self.assertIsNotNone(profile.created_at)
        self.assertIsNotNone(profile.updated_at)
        
        # Update profile and check updated_at changes
        original_updated_at = profile.updated_at
        profile.organization_name = 'Updated Organization'
        profile.save()
        
        self.assertGreater(profile.updated_at, original_updated_at)

    def test_user_profile_meta_ordering(self):
        """Test that UserProfile is ordered by created_at descending."""
        # Create multiple profiles
        user2 = User.objects.create_user(
            username='user2@example.com',
            email='user2@example.com',
            password='TestPass123!'
        )
        
        profile1 = UserProfile.objects.create(user=self.user)
        profile2 = UserProfile.objects.create(user=user2)
        
        # Get all profiles
        profiles = list(UserProfile.objects.all())
        
        # Should be ordered by created_at descending (newest first)
        self.assertEqual(profiles[0], profile2)
        self.assertEqual(profiles[1], profile1)

    def test_user_profile_verbose_names(self):
        """Test model verbose names."""
        self.assertEqual(UserProfile._meta.verbose_name, "User Profile")
        self.assertEqual(UserProfile._meta.verbose_name_plural, "User Profiles")

    def tearDown(self):
        """Clean up test data."""
        User.objects.all().delete()
        UserProfile.objects.all().delete()
