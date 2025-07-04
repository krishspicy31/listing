"""
Unit tests for user serializers.
Tests UserRegistrationSerializer, UserSerializer, and CustomTokenObtainPairSerializer.
"""

import pytest
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import UserProfile
from apps.users.serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileSerializer,
    CustomTokenObtainPairSerializer
)


class UserRegistrationSerializerTest(TestCase):
    """Test cases for UserRegistrationSerializer."""

    def setUp(self):
        """Set up test data."""
        self.valid_data = {
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'New',
            'last_name': 'User',
            'organization_name': 'Test Organization'
        }

    def test_valid_registration_data(self):
        """Test serializer with valid registration data."""
        serializer = UserRegistrationSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())

    def test_password_mismatch(self):
        """Test validation fails when passwords don't match."""
        data = self.valid_data.copy()
        data['password_confirm'] = 'DifferentPassword'
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password_confirm', serializer.errors)

    def test_duplicate_email(self):
        """Test validation fails for duplicate email."""
        # Create existing user
        User.objects.create_user(
            username='existing@example.com',
            email='existing@example.com',
            password='TestPass123!'
        )
        
        data = self.valid_data.copy()
        data['email'] = 'existing@example.com'
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_weak_password_validation(self):
        """Test password validation for weak passwords."""
        weak_passwords = [
            'short',  # Too short
            'alllowercase123',  # No uppercase
            'ALLUPPERCASE123',  # No lowercase
            'NoNumbers!',  # No numbers
            'password123',  # Too common
        ]
        
        for weak_password in weak_passwords:
            data = self.valid_data.copy()
            data['password'] = weak_password
            data['password_confirm'] = weak_password
            
            serializer = UserRegistrationSerializer(data=data)
            self.assertFalse(serializer.is_valid(), f"Password '{weak_password}' should be invalid")
            self.assertIn('password', serializer.errors)

    def test_required_fields(self):
        """Test that required fields are enforced."""
        required_fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name']
        
        for field in required_fields:
            data = self.valid_data.copy()
            del data[field]
            
            serializer = UserRegistrationSerializer(data=data)
            self.assertFalse(serializer.is_valid())
            self.assertIn(field, serializer.errors)

    def test_optional_organization_name(self):
        """Test that organization_name is optional."""
        data = self.valid_data.copy()
        del data['organization_name']
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_create_user_and_profile(self):
        """Test that serializer creates both User and UserProfile."""
        serializer = UserRegistrationSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        
        # Check user was created
        self.assertIsInstance(user, User)
        self.assertEqual(user.email, self.valid_data['email'])
        self.assertEqual(user.username, self.valid_data['email'])  # Email used as username
        self.assertEqual(user.first_name, self.valid_data['first_name'])
        self.assertEqual(user.last_name, self.valid_data['last_name'])
        
        # Check profile was created
        self.assertTrue(hasattr(user, 'profile'))
        self.assertEqual(user.profile.role, 'vendor')
        self.assertEqual(user.profile.organization_name, self.valid_data['organization_name'])

    def test_create_user_without_organization(self):
        """Test creating user without organization name."""
        data = self.valid_data.copy()
        del data['organization_name']
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        user = serializer.save()
        self.assertEqual(user.profile.organization_name, '')

    def test_invalid_email_format(self):
        """Test validation fails for invalid email format."""
        invalid_emails = [
            'notanemail',
            'missing@domain',
            '@missinglocal.com',
            'spaces in@email.com',
            'double@@domain.com'
        ]
        
        for invalid_email in invalid_emails:
            data = self.valid_data.copy()
            data['email'] = invalid_email
            
            serializer = UserRegistrationSerializer(data=data)
            self.assertFalse(serializer.is_valid(), f"Email '{invalid_email}' should be invalid")


class UserSerializerTest(TestCase):
    """Test cases for UserSerializer."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            role='vendor',
            organization_name='Test Organization'
        )

    def test_user_serialization(self):
        """Test serializing a user with profile."""
        serializer = UserSerializer(self.user)
        data = serializer.data
        
        # Check user fields
        self.assertEqual(data['id'], self.user.id)
        self.assertEqual(data['email'], self.user.email)
        self.assertEqual(data['first_name'], self.user.first_name)
        self.assertEqual(data['last_name'], self.user.last_name)
        self.assertEqual(data['name'], f"{self.user.first_name} {self.user.last_name}")
        
        # Check profile is included
        self.assertIn('profile', data)
        self.assertEqual(data['profile']['role'], 'vendor')
        self.assertEqual(data['profile']['organization_name'], 'Test Organization')

    def test_name_field_with_full_name(self):
        """Test name field when user has first and last name."""
        serializer = UserSerializer(self.user)
        data = serializer.data
        expected_name = f"{self.user.first_name} {self.user.last_name}"
        self.assertEqual(data['name'], expected_name)

    def test_name_field_with_organization(self):
        """Test name field falls back to organization name."""
        user = User.objects.create_user(
            username='org@example.com',
            email='org@example.com',
            password='TestPass123!'
        )
        profile = UserProfile.objects.create(
            user=user,
            organization_name='Organization Name'
        )
        
        serializer = UserSerializer(user)
        data = serializer.data
        self.assertEqual(data['name'], 'Organization Name')

    def test_name_field_fallback_to_username(self):
        """Test name field falls back to username."""
        user = User.objects.create_user(
            username='fallback@example.com',
            email='fallback@example.com',
            password='TestPass123!'
        )
        profile = UserProfile.objects.create(user=user)
        
        serializer = UserSerializer(user)
        data = serializer.data
        self.assertEqual(data['name'], user.username)


class UserProfileSerializerTest(TestCase):
    """Test cases for UserProfileSerializer."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='TestPass123!'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            role='vendor',
            organization_name='Test Organization',
            city='Test City',
            is_verified=True
        )

    def test_profile_serialization(self):
        """Test serializing a user profile."""
        serializer = UserProfileSerializer(self.profile)
        data = serializer.data
        
        # Check all fields are included
        expected_fields = [
            'id', 'role', 'organization_name', 'phone_number', 'website',
            'bio', 'avatar', 'city', 'country', 'is_verified', 'created_at', 'updated_at'
        ]
        
        for field in expected_fields:
            self.assertIn(field, data)
        
        # Check specific values
        self.assertEqual(data['role'], 'vendor')
        self.assertEqual(data['organization_name'], 'Test Organization')
        self.assertEqual(data['city'], 'Test City')
        self.assertTrue(data['is_verified'])

    def test_read_only_fields(self):
        """Test that read-only fields cannot be updated."""
        serializer = UserProfileSerializer(self.profile, data={
            'id': 999,
            'created_at': '2020-01-01T00:00:00Z',
            'updated_at': '2020-01-01T00:00:00Z',
            'is_verified': True,
            'role': 'admin'
        }, partial=True)
        
        self.assertTrue(serializer.is_valid())
        updated_profile = serializer.save()
        
        # Read-only fields should not change
        self.assertNotEqual(updated_profile.id, 999)
        self.assertTrue(updated_profile.is_verified)  # This should not change
        self.assertEqual(updated_profile.role, 'admin')  # This should change


class CustomTokenObtainPairSerializerTest(APITestCase):
    """Test cases for CustomTokenObtainPairSerializer."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            role='vendor',
            organization_name='Test Organization'
        )

    def test_token_serializer_includes_user_data(self):
        """Test that token serializer includes user profile data."""
        serializer = CustomTokenObtainPairSerializer()
        serializer.user = self.user
        
        # Validate with correct credentials
        validated_data = serializer.validate({
            'username': 'testuser@example.com',
            'password': 'TestPass123!'
        })
        
        # Check tokens are present
        self.assertIn('access', validated_data)
        self.assertIn('refresh', validated_data)
        
        # Check user data is included
        self.assertIn('user', validated_data)
        user_data = validated_data['user']
        self.assertEqual(user_data['email'], self.user.email)
        self.assertIn('profile', user_data)

    def test_custom_token_claims(self):
        """Test that custom claims are added to JWT token."""
        token = CustomTokenObtainPairSerializer.get_token(self.user)
        
        # Check custom claims
        self.assertEqual(token['role'], 'vendor')
        self.assertEqual(token['name'], "Test User")

    def test_token_claims_without_profile(self):
        """Test token claims when user has no profile."""
        user_no_profile = User.objects.create_user(
            username='noprofile@example.com',
            email='noprofile@example.com',
            password='TestPass123!'
        )
        
        token = CustomTokenObtainPairSerializer.get_token(user_no_profile)
        
        # Should default to 'vendor' role
        self.assertEqual(token['role'], 'vendor')
        self.assertEqual(token['name'], user_no_profile.username)

    def tearDown(self):
        """Clean up test data."""
        User.objects.all().delete()
        UserProfile.objects.all().delete()
