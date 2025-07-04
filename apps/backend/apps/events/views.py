from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound
from django.db.models import Q
from django.db import DatabaseError
from django.core.exceptions import ValidationError
from django.core.paginator import InvalidPage
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from .models import Event
from .serializers import EventSerializer
import logging
import hashlib

logger = logging.getLogger(__name__)


class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom pagination class that returns 404 for invalid page numbers
    instead of raising an exception that results in 500 error.
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        """
        Paginate a queryset if required, either returning a page object,
        or `None` if pagination is not configured for this view.
        """
        page_size = self.get_page_size(request)
        if not page_size:
            return None

        paginator = self.django_paginator_class(queryset, page_size)
        page_number = self.get_page_number(request, paginator)

        try:
            self.page = paginator.page(page_number)
        except InvalidPage as exc:
            # Instead of letting the exception bubble up (which causes 500),
            # raise a proper 404 NotFound exception
            msg = self.invalid_page_message.format(
                page_number=page_number, message=str(exc)
            )
            raise NotFound(msg)

        if paginator.num_pages > 1 and self.template is not None:
            # The browsable API should display pagination controls.
            self.display_page_controls = True

        self.request = request
        return list(self.page)


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
    pagination_class = CustomPageNumberPagination

    def get_cache_key(self):
        """
        Generate a cache key based on query parameters.
        """
        city = self.request.query_params.get('city', '')
        category = self.request.query_params.get('category', '')
        page = self.request.query_params.get('page', '1')

        # Create a hash of the parameters for a consistent cache key
        params_str = f"city:{city}|category:{category}|page:{page}"
        params_hash = hashlib.md5(params_str.encode()).hexdigest()
        return f"events_api_{params_hash}"

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
        Override list method to handle empty results, provide proper HTTP status codes,
        and implement caching for better performance.
        """
        try:
            # Check cache first
            cache_key = self.get_cache_key()
            cached_response = cache.get(cache_key)

            if cached_response is not None:
                return Response(cached_response, status=status.HTTP_200_OK)

            queryset = self.get_queryset()
            page = self.paginate_queryset(queryset)

            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response_data = self.get_paginated_response(serializer.data).data

                # Cache the response for 5 minutes
                cache.set(cache_key, response_data, 300)
                return Response(response_data, status=status.HTTP_200_OK)

            serializer = self.get_serializer(queryset, many=True)
            response_data = serializer.data

            # Cache the response for 5 minutes
            cache.set(cache_key, response_data, 300)
            return Response(response_data, status=status.HTTP_200_OK)

        except NotFound as e:
            # Let NotFound exceptions pass through to return proper 404
            raise e
        except DatabaseError as e:
            logger.error(f"Database error in EventListAPIView: {str(e)}")
            return Response(
                {'error': 'Database error occurred while fetching events'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except ValidationError as e:
            logger.warning(f"Validation error in EventListAPIView: {str(e)}")
            return Response(
                {'error': 'Invalid query parameters provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValueError as e:
            logger.warning(f"Value error in EventListAPIView: {str(e)}")
            return Response(
                {'error': 'Invalid parameter values provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in EventListAPIView: {str(e)}")
            return Response(
                {'error': 'An unexpected error occurred while fetching events'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
