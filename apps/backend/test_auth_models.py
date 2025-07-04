#!/usr/bin/env python
"""
Test script for authentication models and serializers.
"""
import os
import django

# Set required environment variables
os.environ.setdefault('SECRET_KEY', 'test-secret-key-for-testing-only')
os.environ.setdefault('DEBUG', 'True')
os.environ.setdefault('USE_POSTGRESQL', 'False')
os.environ.setdefault('ALLOWED_HOSTS', 'localhost,127.0.0.1,testserver')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'culturalite_backend.settings')

django.setup()

from django.contrib.auth.models import User
from apps.users.models import UserProfile
from apps.users.serializers import UserRegistrationSerializer, UserSerializer

def test_models_and_serializers():
    """Test UserProfile model and serializers."""
    print("Testing Authentication Models and Serializers...")
    print("=" * 60)
    
    # Test UserProfile model
    print("\n1. Testing UserProfile Model")
    
    # Create a test user
    user = User.objects.create_user(
        username='testuser@example.com',
        email='testuser@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )
    print(f"✅ User created: {user.username}")
    
    # Create UserProfile
    profile = UserProfile.objects.create(
        user=user,
        role='vendor',
        organization_name='Test Organization',
        city='Test City'
    )
    print(f"✅ UserProfile created with role: {profile.role}")
    print(f"✅ Display name: {profile.display_name}")
    print(f"✅ String representation: {profile}")
    
    # Test UserRegistrationSerializer
    print("\n2. Testing UserRegistrationSerializer")
    
    registration_data = {
        'email': 'newvendor@example.com',
        'password': 'SecurePass123!',
        'password_confirm': 'SecurePass123!',
        'first_name': 'New',
        'last_name': 'Vendor',
        'organization_name': 'New Organization'
    }
    
    serializer = UserRegistrationSerializer(data=registration_data)
    if serializer.is_valid():
        print("✅ Registration data is valid")
        
        # Test user creation
        new_user = serializer.save()
        print(f"✅ New user created: {new_user.username}")
        
        # Check if profile was created
        new_profile = UserProfile.objects.get(user=new_user)
        print(f"✅ Profile created with role: {new_profile.role}")
        print(f"✅ Organization: {new_profile.organization_name}")
    else:
        print(f"❌ Registration data invalid: {serializer.errors}")
    
    # Test UserSerializer
    print("\n3. Testing UserSerializer")
    user_serializer = UserSerializer(new_user)
    user_data = user_serializer.data
    print(f"✅ User serialized successfully")
    print(f"User data: {user_data}")
    
    # Test validation errors
    print("\n4. Testing Validation Errors")
    
    # Test duplicate email
    duplicate_data = registration_data.copy()
    duplicate_serializer = UserRegistrationSerializer(data=duplicate_data)
    if not duplicate_serializer.is_valid():
        print("✅ Duplicate email validation working")
        print(f"Errors: {duplicate_serializer.errors}")
    
    # Test password mismatch
    mismatch_data = registration_data.copy()
    mismatch_data['email'] = 'another@example.com'
    mismatch_data['password_confirm'] = 'DifferentPassword'
    mismatch_serializer = UserRegistrationSerializer(data=mismatch_data)
    if not mismatch_serializer.is_valid():
        print("✅ Password mismatch validation working")
        print(f"Errors: {mismatch_serializer.errors}")
    
    print("\n" + "=" * 60)
    print("Model and serializer testing completed!")
    
    # Clean up
    User.objects.filter(email__in=['testuser@example.com', 'newvendor@example.com']).delete()
    print("✅ Test data cleaned up")

if __name__ == '__main__':
    test_models_and_serializers()
