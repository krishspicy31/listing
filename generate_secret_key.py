#!/usr/bin/env python3
"""
Generate a Django SECRET_KEY for production use
"""

from django.core.management.utils import get_random_secret_key

def generate_secret_key():
    """Generate a new Django secret key"""
    secret_key = get_random_secret_key()
    print("🔐 Generated Django SECRET_KEY:")
    print(f"SECRET_KEY={secret_key}")
    print("\n📋 Copy this to your Vercel environment variables:")
    print(f"SECRET_KEY={secret_key}")
    print("\n⚠️  Keep this secret and never commit it to version control!")
    return secret_key

if __name__ == "__main__":
    generate_secret_key()
