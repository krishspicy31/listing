"""
Unit tests for authentication views.
Tests registration, login, logout, and token refresh endpoints.
"""

import json
import pytest
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import UserProfile


class RegisterViewTest(APITestCase):
    """Test cases for user registration endpoint."""

    def setUp(self):
        """Set up test data."""
        self.register_url = reverse('auth_register')
        self.valid_data = {
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'New',
            'last_name': 'User',
            'organization_name': 'Test Organization'
        }

    def test_successful_registration(self):
        """Test successful user registration."""
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('user', response.data)
        
        # Check user was created in database
        user = User.objects.get(email=self.valid_data['email'])
        self.assertEqual(user.username, self.valid_data['email'])
        self.assertEqual(user.first_name, self.valid_data['first_name'])
        self.assertEqual(user.last_name, self.valid_data['last_name'])
        
        # Check profile was created
        self.assertTrue(hasattr(user, 'profile'))
        self.assertEqual(user.profile.role, 'vendor')
        self.assertEqual(user.profile.organization_name, self.valid_data['organization_name'])

    def test_registration_password_mismatch(self):
        """Test registration fails with password mismatch."""
        data = self.valid_data.copy()
        data['password_confirm'] = 'DifferentPassword'
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertIn('details', response.data)

    def test_registration_duplicate_email(self):
        """Test registration fails with duplicate email."""
        # Create existing user
        User.objects.create_user(
            username='existing@example.com',
            email='existing@example.com',
            password='TestPass123!'
        )
        
        data = self.valid_data.copy()
        data['email'] = 'existing@example.com'
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_registration_weak_password(self):
        """Test registration fails with weak password."""
        data = self.valid_data.copy()
        data['password'] = 'weak'
        data['password_confirm'] = 'weak'
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_registration_missing_required_fields(self):
        """Test registration fails with missing required fields."""
        required_fields = ['email', 'password', 'password_confirm', 'first_name', 'last_name']
        
        for field in required_fields:
            data = self.valid_data.copy()
            del data[field]
            
            response = self.client.post(self.register_url, data, format='json')
            
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn('error', response.data)

    def test_registration_rate_limiting(self):
        """Test that registration is rate limited."""
        # Make multiple rapid requests
        for i in range(5):  # Rate limit is 3/minute
            data = self.valid_data.copy()
            data['email'] = f'user{i}@example.com'
            response = self.client.post(self.register_url, data, format='json')
            
            if i < 3:
                self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
            else:
                # Should be rate limited after 3 attempts
                self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class LoginViewTest(APITestCase):
    """Test cases for user login endpoint."""

    def setUp(self):
        """Set up test data."""
        self.login_url = reverse('auth_login')
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
        self.login_data = {
            'username': 'testuser@example.com',
            'password': 'TestPass123!'
        }

    def test_successful_login(self):
        """Test successful user login."""
        response = self.client.post(self.login_url, self.login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)
        
        # Check user data is included
        user_data = response.data['user']
        self.assertEqual(user_data['email'], self.user.email)
        self.assertIn('profile', user_data)
        self.assertEqual(user_data['profile']['role'], 'vendor')
        
        # Check that refresh token is set as httpOnly cookie
        self.assertIn('refresh_token', response.cookies)
        cookie = response.cookies['refresh_token']
        self.assertTrue(cookie['httponly'])

    def test_login_invalid_credentials(self):
        """Test login fails with invalid credentials."""
        data = self.login_data.copy()
        data['password'] = 'WrongPassword'
        
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_credentials(self):
        """Test login fails with missing credentials."""
        # Missing password
        response = self.client.post(self.login_url, {'username': 'testuser@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Missing username
        response = self.client.post(self.login_url, {'password': 'TestPass123!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_rate_limiting(self):
        """Test that login is rate limited."""
        # Make multiple rapid requests with wrong password
        for i in range(7):  # Rate limit is 5/minute
            data = self.login_data.copy()
            data['password'] = 'WrongPassword'
            response = self.client.post(self.login_url, data, format='json')
            
            if i < 5:
                self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
            else:
                # Should be rate limited after 5 attempts
                self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class TokenRefreshViewTest(APITestCase):
    """Test cases for token refresh endpoint."""

    def setUp(self):
        """Set up test data."""
        self.refresh_url = reverse('auth_refresh')
        self.user = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='TestPass123!'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.refresh_token = RefreshToken.for_user(self.user)

    def test_successful_token_refresh_with_cookie(self):
        """Test successful token refresh using httpOnly cookie."""
        # Set refresh token as cookie
        self.client.cookies['refresh_token'] = str(self.refresh_token)
        
        response = self.client.post(self.refresh_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('message', response.data)

    def test_successful_token_refresh_with_body(self):
        """Test successful token refresh using request body."""
        data = {'refresh': str(self.refresh_token)}
        
        response = self.client.post(self.refresh_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_token_refresh_missing_token(self):
        """Test token refresh fails without refresh token."""
        response = self.client.post(self.refresh_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_token_refresh_invalid_token(self):
        """Test token refresh fails with invalid token."""
        data = {'refresh': 'invalid_token'}
        
        response = self.client.post(self.refresh_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_token_refresh_rate_limiting(self):
        """Test that token refresh is rate limited."""
        self.client.cookies['refresh_token'] = str(self.refresh_token)
        
        # Make multiple rapid requests
        for i in range(12):  # Rate limit is 10/minute
            response = self.client.post(self.refresh_url, format='json')
            
            if i < 10:
                self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED])
            else:
                # Should be rate limited after 10 attempts
                self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class LogoutViewTest(APITestCase):
    """Test cases for user logout endpoint."""

    def setUp(self):
        """Set up test data."""
        self.logout_url = reverse('auth_logout')
        self.user = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='TestPass123!'
        )
        self.profile = UserProfile.objects.create(user=self.user)
        self.refresh_token = RefreshToken.for_user(self.user)

    def test_successful_logout_with_cookie(self):
        """Test successful logout using httpOnly cookie."""
        # Set refresh token as cookie
        self.client.cookies['refresh_token'] = str(self.refresh_token)
        
        response = self.client.post(self.logout_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Check that refresh token cookie is cleared
        self.assertIn('refresh_token', response.cookies)

    def test_successful_logout_with_body(self):
        """Test successful logout using request body."""
        data = {'refresh': str(self.refresh_token)}
        
        response = self.client.post(self.logout_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_logout_missing_token(self):
        """Test logout fails without refresh token."""
        response = self.client.post(self.logout_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_logout_invalid_token(self):
        """Test logout handles invalid token gracefully."""
        data = {'refresh': 'invalid_token'}
        
        response = self.client.post(self.logout_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def tearDown(self):
        """Clean up test data."""
        User.objects.all().delete()
        UserProfile.objects.all().delete()
