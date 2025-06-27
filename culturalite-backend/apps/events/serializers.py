from rest_framework import serializers
from .models import Event, Category


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model.
    Returns category name and slug for nested representation in events.
    """
    class Meta:
        model = Category
        fields = ['name', 'slug']


class EventSerializer(serializers.ModelSerializer):
    """
    Serializer for Event model.
    Returns all required fields for public API with nested category information.
    """
    category = CategorySerializer(read_only=True)
    event_date = serializers.DateTimeField(format='%Y-%m-%dT%H:%M:%S.%fZ')
    
    class Meta:
        model = Event
        fields = [
            'id',
            'title', 
            'description',
            'city',
            'event_date',
            'image_url',
            'category'
        ]
