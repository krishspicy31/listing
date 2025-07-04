from django.test import TestCase, Client
from django.urls import reverse
import json


class HealthEndpointTestCase(TestCase):
    """Test cases for the health check endpoint"""
    
    def setUp(self):
        self.client = Client()
    
    def test_health_endpoint_returns_200(self):
        """Test that health endpoint returns 200 status code"""
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
    
    def test_health_endpoint_returns_json(self):
        """Test that health endpoint returns JSON response"""
        response = self.client.get('/api/health/')
        self.assertEqual(response['Content-Type'], 'application/json')
    
    def test_health_endpoint_response_structure(self):
        """Test that health endpoint returns expected JSON structure"""
        response = self.client.get('/api/health/')
        data = json.loads(response.content)
        
        # Check required fields exist
        self.assertIn('status', data)
        self.assertIn('message', data)
        self.assertIn('version', data)
        
        # Check field values
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['message'], 'Culturalite Backend is running')
        self.assertEqual(data['version'], '1.0.0')
    
    def test_health_endpoint_accessible_via_reverse_url(self):
        """Test that health endpoint is accessible via reverse URL lookup"""
        url = reverse('health_check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
