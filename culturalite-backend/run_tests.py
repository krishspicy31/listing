#!/usr/bin/env python
"""
Test runner script that sets up the required environment variables
and runs Django tests for the events app.
"""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

if __name__ == "__main__":
    # Set required environment variables
    os.environ.setdefault('SECRET_KEY', 'test-secret-key-for-testing-only')
    os.environ.setdefault('DEBUG', 'True')
    os.environ.setdefault('USE_POSTGRESQL', 'False')  # Use SQLite for testing
    
    # Set up Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'culturalite_backend.settings')
    django.setup()
    
    # Run tests
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(["apps.events.tests"])
    
    if failures:
        sys.exit(1)
