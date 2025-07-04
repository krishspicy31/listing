from django.test import TestCase
from django.db import connection
from django.core.management import call_command


class DatabaseConnectivityTestCase(TestCase):
    """Test cases for database connectivity"""
    
    def test_database_connection(self):
        """Test that database connection is working"""
        # This will raise an exception if database connection fails
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            self.assertEqual(result[0], 1)
    
    def test_database_migrations_applied(self):
        """Test that database migrations have been applied"""
        # Check if we can query the auth_user table (created by Django migrations)
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_name = 'auth_user'
            """) if connection.vendor == 'postgresql' else cursor.execute("""
                SELECT COUNT(*) 
                FROM sqlite_master 
                WHERE type='table' AND name='auth_user'
            """)
            result = cursor.fetchone()
            self.assertEqual(result[0], 1)
    
    def test_database_write_operations(self):
        """Test that database write operations work"""
        from django.contrib.auth.models import User
        
        # Create a test user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Verify user was created
        self.assertTrue(User.objects.filter(username='testuser').exists())
        
        # Clean up
        user.delete()
        self.assertFalse(User.objects.filter(username='testuser').exists())
