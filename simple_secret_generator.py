#!/usr/bin/env python3
"""
Simple secret key generator without Django dependency
"""

import secrets
import string

def generate_simple_secret_key(length=50):
    """Generate a random secret key"""
    alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
    secret_key = ''.join(secrets.choice(alphabet) for _ in range(length))
    print("🔐 Generated SECRET_KEY:")
    print(f"SECRET_KEY={secret_key}")
    print("\n📋 Copy this to your Vercel environment variables")
    return secret_key

if __name__ == "__main__":
    generate_simple_secret_key()
