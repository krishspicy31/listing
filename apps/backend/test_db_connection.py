#!/usr/bin/env python
"""
Test database connection and create a test user.
"""
import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'culturalite_backend.settings')
django.setup()

from django.contrib.auth.models import User
from apps.users.models import UserProfile
from django.db import connection

def test_database_connection():
    """Test PostgreSQL database connection and create test data."""
    print("Testing PostgreSQL Database Connection...")
    print("=" * 50)
    
    # Test basic connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ PostgreSQL Version: {version[0]}")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return
    
    # Test User model
    try:
        user_count = User.objects.count()
        print(f"✅ Current users in database: {user_count}")
    except Exception as e:
        print(f"❌ User model query failed: {e}")
        return
    
    # Test UserProfile model
    try:
        profile_count = UserProfile.objects.count()
        print(f"✅ Current user profiles in database: {profile_count}")
    except Exception as e:
        print(f"❌ UserProfile model query failed: {e}")
        return
    
    # Create a test vendor user
    try:
        test_email = "test.vendor@culturalite.com"
        
        # Check if user already exists
        if User.objects.filter(email=test_email).exists():
            print(f"✅ Test user already exists: {test_email}")
            user = User.objects.get(email=test_email)
        else:
            # Create new test user
            user = User.objects.create_user(
                username=test_email,
                email=test_email,
                password="TestPass123!",
                first_name="Test",
                last_name="Vendor"
            )
            print(f"✅ Created test user: {test_email}")
        
        # Check if profile exists
        if hasattr(user, 'profile'):
            print(f"✅ User profile exists with role: {user.profile.role}")
        else:
            # Create profile
            profile = UserProfile.objects.create(
                user=user,
                role='vendor',
                organization_name='Test Organization'
            )
            print(f"✅ Created user profile with role: {profile.role}")
            
    except Exception as e:
        print(f"❌ Test user creation failed: {e}")
        return
    
    print("\n" + "=" * 50)
    print("✅ Database connection and models working correctly!")
    print(f"✅ Total users: {User.objects.count()}")
    print(f"✅ Total profiles: {UserProfile.objects.count()}")

if __name__ == '__main__':
    test_database_connection()
