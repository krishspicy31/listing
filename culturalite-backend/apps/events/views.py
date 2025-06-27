from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import Event
from .serializers import EventSerializer


class EventListAPIView(generics.ListAPIView):
    """
    Public API endpoint to list approved events.

    Supports filtering by:
    - city: Filter events by city (case-insensitive)
    - category: Filter events by category name (case-insensitive)

    Returns paginated list of approved events with nested category information.
    """
    serializer_class = EventSerializer
    permission_classes = [AllowAny]  # Public endpoint

    def get_queryset(self):
        """
        Return queryset of approved events with optional filtering.
        Optimized with select_related to avoid N+1 queries.
        """
        queryset = Event.objects.filter(status='approved').select_related('category')

        # Filter by city if provided
        city = self.request.query_params.get('city', None)
        if city is not None:
            queryset = queryset.filter(city__icontains=city)

        # Filter by category if provided
        category = self.request.query_params.get('category', None)
        if category is not None:
            queryset = queryset.filter(category__name__icontains=category)

        return queryset.order_by('-event_date')

    def list(self, request, *args, **kwargs):
        """
        Override list method to handle empty results and provide proper HTTP status codes.
        """
        try:
            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)

            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': 'An error occurred while fetching events'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
