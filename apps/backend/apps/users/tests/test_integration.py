"""
Integration tests for authentication flow.
Tests complete registration -> login -> token refresh -> logout flow.
"""

import json
import pytest
from django.test import TestCase, TransactionTestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models import UserProfile


class AuthenticationFlowIntegrationTest(APITestCase):
    """Integration tests for complete authentication flow."""

    def setUp(self):
        """Set up test URLs."""
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.refresh_url = reverse('auth_refresh')
        self.logout_url = reverse('auth_logout')
        
        self.registration_data = {
            'email': 'integration@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'Integration',
            'last_name': 'Test',
            'organization_name': 'Integration Test Org'
        }

    def test_complete_authentication_flow(self):
        """Test complete flow: register -> login -> refresh -> logout."""
        
        # Step 1: Register new user
        register_response = self.client.post(
            self.register_url, 
            self.registration_data, 
            format='json'
        )
        
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', register_response.data)
        self.assertIn('user', register_response.data)
        
        # Verify user and profile were created
        user = User.objects.get(email=self.registration_data['email'])
        self.assertEqual(user.profile.role, 'vendor')
        self.assertEqual(user.profile.organization_name, 'Integration Test Org')
        
        # Step 2: Login with registered credentials
        login_data = {
            'username': self.registration_data['email'],
            'password': self.registration_data['password']
        }
        
        login_response = self.client.post(self.login_url, login_data, format='json')
        
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('user', login_response.data)
        
        # Check refresh token cookie is set
        self.assertIn('refresh_token', login_response.cookies)
        refresh_cookie = login_response.cookies['refresh_token']
        self.assertTrue(refresh_cookie['httponly'])
        
        access_token = login_response.data['access']
        
        # Step 3: Use access token for authenticated request
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        
        # Step 4: Refresh token using cookie
        # Set the refresh token cookie for the next request
        self.client.cookies['refresh_token'] = refresh_cookie.value
        
        refresh_response = self.client.post(self.refresh_url, format='json')
        
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)
        self.assertIn('message', refresh_response.data)
        
        new_access_token = refresh_response.data['access']
        self.assertNotEqual(access_token, new_access_token)
        
        # Step 5: Logout
        logout_response = self.client.post(self.logout_url, format='json')
        
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        self.assertIn('message', logout_response.data)
        
        # Check that refresh token cookie is cleared
        self.assertIn('refresh_token', logout_response.cookies)

    def test_registration_login_with_different_passwords(self):
        """Test that registration and login work with complex passwords."""
        complex_passwords = [
            'Complex123!@#',
            'AnotherSecure456$%^',
            'VeryLong789&*()Password'
        ]
        
        for i, password in enumerate(complex_passwords):
            email = f'complex{i}@example.com'
            
            # Register with complex password
            registration_data = {
                'email': email,
                'password': password,
                'password_confirm': password,
                'first_name': 'Complex',
                'last_name': f'User{i}'
            }
            
            register_response = self.client.post(
                self.register_url, 
                registration_data, 
                format='json'
            )
            
            self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
            
            # Login with complex password
            login_data = {
                'username': email,
                'password': password
            }
            
            login_response = self.client.post(self.login_url, login_data, format='json')
            
            self.assertEqual(login_response.status_code, status.HTTP_200_OK)
            self.assertIn('access', login_response.data)

    def test_token_blacklisting_on_logout(self):
        """Test that refresh tokens are properly blacklisted on logout."""
        
        # Register and login
        register_response = self.client.post(
            self.register_url, 
            self.registration_data, 
            format='json'
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        
        login_data = {
            'username': self.registration_data['email'],
            'password': self.registration_data['password']
        }
        
        login_response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        
        # Get refresh token from cookie
        refresh_cookie = login_response.cookies['refresh_token']
        self.client.cookies['refresh_token'] = refresh_cookie.value
        
        # Logout (should blacklist the token)
        logout_response = self.client.post(self.logout_url, format='json')
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        
        # Try to use the blacklisted token for refresh
        refresh_response = self.client.post(self.refresh_url, format='json')
        
        # Should fail because token is blacklisted
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_multiple_concurrent_sessions(self):
        """Test that multiple sessions can exist for the same user."""
        
        # Register user
        register_response = self.client.post(
            self.register_url, 
            self.registration_data, 
            format='json'
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        
        login_data = {
            'username': self.registration_data['email'],
            'password': self.registration_data['password']
        }
        
        # Create two separate clients for different sessions
        client1 = APIClient()
        client2 = APIClient()
        
        # Login from first client
        login1_response = client1.post(self.login_url, login_data, format='json')
        self.assertEqual(login1_response.status_code, status.HTTP_200_OK)
        
        # Login from second client
        login2_response = client2.post(self.login_url, login_data, format='json')
        self.assertEqual(login2_response.status_code, status.HTTP_200_OK)
        
        # Both should have different tokens
        token1 = login1_response.data['access']
        token2 = login2_response.data['access']
        self.assertNotEqual(token1, token2)
        
        # Both tokens should work for authenticated requests
        client1.credentials(HTTP_AUTHORIZATION=f'Bearer {token1}')
        client2.credentials(HTTP_AUTHORIZATION=f'Bearer {token2}')
        
        # Both should be able to refresh
        client1.cookies['refresh_token'] = login1_response.cookies['refresh_token'].value
        client2.cookies['refresh_token'] = login2_response.cookies['refresh_token'].value
        
        refresh1_response = client1.post(self.refresh_url, format='json')
        refresh2_response = client2.post(self.refresh_url, format='json')
        
        self.assertEqual(refresh1_response.status_code, status.HTTP_200_OK)
        self.assertEqual(refresh2_response.status_code, status.HTTP_200_OK)

    def test_user_profile_data_consistency(self):
        """Test that user profile data is consistent across all endpoints."""
        
        # Register user
        register_response = self.client.post(
            self.register_url, 
            self.registration_data, 
            format='json'
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        
        registration_user_data = register_response.data['user']
        
        # Login
        login_data = {
            'username': self.registration_data['email'],
            'password': self.registration_data['password']
        }
        
        login_response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        
        login_user_data = login_response.data['user']
        
        # Check that user data is consistent
        self.assertEqual(registration_user_data['email'], login_user_data['email'])
        self.assertEqual(registration_user_data['first_name'], login_user_data['first_name'])
        self.assertEqual(registration_user_data['last_name'], login_user_data['last_name'])
        self.assertEqual(registration_user_data['profile']['role'], login_user_data['profile']['role'])
        self.assertEqual(
            registration_user_data['profile']['organization_name'], 
            login_user_data['profile']['organization_name']
        )

    def test_error_handling_in_flow(self):
        """Test error handling at each step of the authentication flow."""
        
        # Test registration with invalid data
        invalid_registration = self.registration_data.copy()
        invalid_registration['password_confirm'] = 'different_password'
        
        register_response = self.client.post(
            self.register_url, 
            invalid_registration, 
            format='json'
        )
        
        self.assertEqual(register_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', register_response.data)
        
        # Register valid user
        register_response = self.client.post(
            self.register_url, 
            self.registration_data, 
            format='json'
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        
        # Test login with wrong password
        wrong_login_data = {
            'username': self.registration_data['email'],
            'password': 'WrongPassword123!'
        }
        
        login_response = self.client.post(self.login_url, wrong_login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Test refresh without token
        refresh_response = self.client.post(self.refresh_url, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test logout without token
        logout_response = self.client.post(self.logout_url, format='json')
        self.assertEqual(logout_response.status_code, status.HTTP_400_BAD_REQUEST)

    def tearDown(self):
        """Clean up test data."""
        User.objects.all().delete()
        UserProfile.objects.all().delete()
