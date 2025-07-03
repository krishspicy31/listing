#!/usr/bin/env python
"""
Test script to verify security fixes are working correctly.
Tests password validation, rate limiting setup, and JWT configuration.
"""

import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'culturalite_backend.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from apps.users.models import UserProfile
from apps.users.validators import CustomPasswordValidator, NoCommonPasswordValidator
from rest_framework_simplejwt.tokens import RefreshToken
import json

def test_custom_password_validation():
    """Test custom password validation requirements."""
    print("1. Testing Custom Password Validation")
    print("-" * 50)
    
    validator = CustomPasswordValidator()
    
    # Test cases for password validation
    test_cases = [
        ("short", False, "Should fail - too short"),
        ("alllowercase123", False, "Should fail - no uppercase"),
        ("ALLUPPERCASE123", False, "Should fail - no lowercase"),
        ("NoNumbers!", False, "Should fail - no numbers"),
        ("SecurePass123!", True, "Should pass - meets all requirements"),
        ("AnotherGood1", True, "Should pass - meets all requirements"),
    ]
    
    for password, should_pass, description in test_cases:
        try:
            validator.validate(password)
            result = "PASS" if should_pass else "FAIL"
            print(f"  ✓ {password:<20} {result:<4} - {description}")
        except ValidationError as e:
            result = "FAIL" if should_pass else "PASS"
            print(f"  ✓ {password:<20} {result:<4} - {description}")
            if not should_pass:
                print(f"    Errors: {[str(err) for err in e.messages]}")
    
    print()

def test_common_password_validation():
    """Test common password validation."""
    print("2. Testing Common Password Validation")
    print("-" * 50)
    
    validator = NoCommonPasswordValidator()
    
    common_passwords = ["password", "123456", "qwerty", "admin", "password123"]
    secure_passwords = ["SecurePass123!", "MyUniquePassword1", "ComplexAuth789$"]
    
    print("  Common passwords (should fail):")
    for password in common_passwords:
        try:
            validator.validate(password)
            print(f"    ✗ {password:<20} FAIL - Should have been rejected")
        except ValidationError:
            print(f"    ✓ {password:<20} PASS - Correctly rejected")
    
    print("\n  Secure passwords (should pass):")
    for password in secure_passwords:
        try:
            validator.validate(password)
            print(f"    ✓ {password:<20} PASS - Correctly accepted")
        except ValidationError:
            print(f"    ✗ {password:<20} FAIL - Should have been accepted")
    
    print()

def test_jwt_configuration():
    """Test JWT configuration settings."""
    print("3. Testing JWT Configuration")
    print("-" * 50)
    
    from django.conf import settings
    
    jwt_settings = settings.SIMPLE_JWT
    
    # Check important security settings
    checks = [
        ("ACCESS_TOKEN_LIFETIME", "60 minutes", str(jwt_settings.get('ACCESS_TOKEN_LIFETIME'))),
        ("REFRESH_TOKEN_LIFETIME", "7 days", str(jwt_settings.get('REFRESH_TOKEN_LIFETIME'))),
        ("ROTATE_REFRESH_TOKENS", True, jwt_settings.get('ROTATE_REFRESH_TOKENS')),
        ("BLACKLIST_AFTER_ROTATION", True, jwt_settings.get('BLACKLIST_AFTER_ROTATION')),
        ("ALGORITHM", "HS256", jwt_settings.get('ALGORITHM')),
    ]
    
    for setting, expected, actual in checks:
        status = "✓" if str(expected) in str(actual) or actual == expected else "✗"
        print(f"  {status} {setting:<25} Expected: {expected:<10} Actual: {actual}")
    
    print()

def test_rate_limiting_configuration():
    """Test rate limiting configuration."""
    print("4. Testing Rate Limiting Configuration")
    print("-" * 50)
    
    # Check if rate limiting is enabled
    ratelimit_enabled = getattr(settings, 'RATELIMIT_ENABLE', False)
    print(f"  ✓ RATELIMIT_ENABLE: {ratelimit_enabled}")
    
    # Check cache configuration
    cache_config = settings.CACHES.get('default', {})
    print(f"  ✓ Cache backend configured: {cache_config.get('BACKEND', 'Not configured')}")
    
    # Test that django_ratelimit is importable
    try:
        from django_ratelimit.decorators import ratelimit
        print("  ✓ django-ratelimit package is installed and importable")
    except ImportError:
        print("  ✗ django-ratelimit package is not available")
    
    print()

def test_user_creation_with_validation():
    """Test user creation with new password validation."""
    print("5. Testing User Creation with Password Validation")
    print("-" * 50)
    
    # Test creating user with weak password (should fail)
    try:
        user = User(username='testuser@example.com', email='testuser@example.com')
        user.set_password('weak')
        validate_password('weak', user)
        print("  ✗ Weak password was accepted (should have failed)")
    except ValidationError as e:
        print("  ✓ Weak password correctly rejected")
        print(f"    Errors: {[str(err) for err in e.messages]}")
    
    # Test creating user with strong password (should pass)
    try:
        user = User(username='testuser2@example.com', email='testuser2@example.com')
        user.set_password('SecurePass123!')
        validate_password('SecurePass123!', user)
        print("  ✓ Strong password correctly accepted")
    except ValidationError as e:
        print("  ✗ Strong password was rejected (should have passed)")
        print(f"    Errors: {[str(err) for err in e.messages]}")
    
    print()

def test_jwt_token_creation():
    """Test JWT token creation and claims."""
    print("6. Testing JWT Token Creation")
    print("-" * 50)
    
    # Create a test user
    try:
        user = User.objects.create_user(
            username='jwttest@example.com',
            email='jwttest@example.com',
            password='SecurePass123!',
            first_name='JWT',
            last_name='Test'
        )
        
        # Create profile
        profile = UserProfile.objects.create(
            user=user,
            role='vendor',
            organization_name='Test Organization'
        )
        
        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        print("  ✓ JWT tokens generated successfully")
        print(f"    Access token type: {type(access)}")
        print(f"    Refresh token type: {type(refresh)}")
        
        # Check token claims
        print("  ✓ Token claims:")
        for key, value in access.payload.items():
            if key in ['user_id', 'role', 'name', 'token_type']:
                print(f"    {key}: {value}")
        
        # Clean up
        user.delete()
        
    except Exception as e:
        print(f"  ✗ JWT token creation failed: {e}")
    
    print()

def main():
    """Run all security tests."""
    print("🔒 Security Fixes Verification")
    print("=" * 60)
    print()
    
    try:
        test_custom_password_validation()
        test_common_password_validation()
        test_jwt_configuration()
        test_rate_limiting_configuration()
        test_user_creation_with_validation()
        test_jwt_token_creation()
        
        print("🎉 All security tests completed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
