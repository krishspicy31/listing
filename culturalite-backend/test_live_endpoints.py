#!/usr/bin/env python
"""
Test authentication endpoints on live server using requests.
"""
import requests
import json
import time

def test_live_endpoints():
    """Test authentication endpoints on running Django server."""
    base_url = "http://127.0.0.1:8000/api"
    
    print("Testing Live Authentication Endpoints...")
    print("=" * 60)
    
    # Test health endpoint first
    try:
        response = requests.get(f"{base_url}/health/", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and accessible")
            print(f"Health check response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to server: {e}")
        print("Make sure Django server is running on http://127.0.0.1:8000")
        return
    
    # Test registration endpoint
    print("\n1. Testing Registration Endpoint")
    registration_data = {
        'email': 'livetest@culturalite.com',
        'password': 'SecurePass123!',
        'password_confirm': 'SecurePass123!',
        'first_name': 'Live',
        'last_name': 'Test',
        'organization_name': 'Live Test Organization'
    }
    
    try:
        response = requests.post(
            f"{base_url}/auth/register/",
            json=registration_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Registration Status Code: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Registration successful!")
            result = response.json()
            print(f"Response: {result}")
            
            # Test login endpoint
            print("\n2. Testing Login Endpoint")
            login_data = {
                'username': 'livetest@culturalite.com',
                'password': 'SecurePass123!'
            }
            
            response = requests.post(
                f"{base_url}/auth/login/",
                json=login_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"Login Status Code: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ Login successful!")
                login_result = response.json()
                print(f"Login response keys: {list(login_result.keys())}")
                
                if 'access' in login_result and 'refresh' in login_result:
                    print("✅ JWT tokens received!")
                    
                if 'user' in login_result:
                    print("✅ User profile data included!")
                    user_data = login_result['user']
                    print(f"User: {user_data.get('name')} ({user_data.get('email')})")
                    print(f"Role: {user_data.get('profile', {}).get('role')}")
                    
                    # Test token refresh
                    print("\n3. Testing Token Refresh")
                    refresh_data = {
                        'refresh': login_result['refresh']
                    }
                    
                    response = requests.post(
                        f"{base_url}/auth/refresh/",
                        json=refresh_data,
                        headers={'Content-Type': 'application/json'},
                        timeout=10
                    )
                    
                    print(f"Refresh Status Code: {response.status_code}")
                    
                    if response.status_code == 200:
                        print("✅ Token refresh successful!")
                        refresh_result = response.json()
                        print(f"New access token received: {'access' in refresh_result}")
                    else:
                        print(f"❌ Token refresh failed: {response.text}")
                        
            else:
                print(f"❌ Login failed: {response.text}")
                
        elif response.status_code == 400:
            print("❌ Registration failed with validation errors:")
            try:
                error_data = response.json()
                print(f"Errors: {error_data}")
            except:
                print(f"Response: {response.text}")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    
    print("\n" + "=" * 60)
    print("Live endpoint testing completed!")

if __name__ == '__main__':
    test_live_endpoints()
