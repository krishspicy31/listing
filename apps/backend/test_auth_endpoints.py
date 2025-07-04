#!/usr/bin/env python
"""
Test script for authentication endpoints.
"""
import os
import django
import json

# Set required environment variables
os.environ.setdefault('SECRET_KEY', 'test-secret-key-for-testing-only')
os.environ.setdefault('DEBUG', 'True')
os.environ.setdefault('USE_POSTGRESQL', 'False')
os.environ.setdefault('ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'culturalite_backend.settings')

django.setup()

from django.test import Client
from django.contrib.auth.models import User
from apps.users.models import UserProfile

def test_auth_endpoints():
    """Test authentication endpoints functionality."""
    client = Client()
    
    print("Testing Authentication Endpoints...")
    print("=" * 50)
    
    # Test registration endpoint
    print("\n1. Testing Registration Endpoint")
    registration_data = {
        'email': 'newvendor@culturalite.com',
        'password': 'SecurePass123!',
        'password_confirm': 'SecurePass123!',
        'first_name': 'New',
        'last_name': 'Vendor',
        'organization_name': 'New Test Organization'
    }
    
    response = client.post('/api/auth/register/', 
                          data=json.dumps(registration_data),
                          content_type='application/json')
    
    print(f"Registration Status Code: {response.status_code}")
    print(f"Registration Response: {response.json()}")
    
    if response.status_code == 201:
        print("✅ Registration successful!")
        
        # Verify user was created
        user = User.objects.get(email='newvendor@culturalite.com')
        print(f"✅ User created: {user.username}")
        
        # Verify profile was created
        profile = UserProfile.objects.get(user=user)
        print(f"✅ Profile created with role: {profile.role}")
        
        # Test login endpoint
        print("\n2. Testing Login Endpoint")
        login_data = {
            'username': 'newvendor@culturalite.com',  # Using email as username
            'password': 'SecurePass123!'
        }
        
        response = client.post('/api/auth/login/',
                              data=json.dumps(login_data),
                              content_type='application/json')
        
        print(f"Login Status Code: {response.status_code}")
        print(f"Login Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            login_response = response.json()
            
            if 'access' in login_response and 'refresh' in login_response:
                print("✅ JWT tokens received!")
                
            if 'user' in login_response:
                print("✅ User profile data included!")
                print(f"User data: {login_response['user']}")
        else:
            print("❌ Login failed!")
    else:
        print("❌ Registration failed!")
    
    print("\n" + "=" * 50)
    print("Authentication endpoint testing completed!")

if __name__ == '__main__':
    test_auth_endpoints()
