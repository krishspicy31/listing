from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from django_ratelimit.exceptions import Ratelimited
from datetime import datetime, timedelta
from .serializers import UserRegistrationSerializer, CustomTokenObtainPairSerializer, UserSerializer


@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='post')
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that returns JWT tokens with user profile data.
    Includes rate limiting and secure cookie handling for refresh tokens.
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        """Handle login with rate limiting and secure cookie setting."""
        try:
            response = super().post(request, *args, **kwargs)

            if response.status_code == 200:
                # Extract refresh token from response data
                refresh_token = response.data.get('refresh')

                if refresh_token:
                    # Remove refresh token from response body
                    response.data.pop('refresh', None)

                    # Set refresh token as httpOnly cookie
                    response.set_cookie(
                        'refresh_token',
                        refresh_token,
                        max_age=7 * 24 * 60 * 60,  # 7 days
                        httponly=True,
                        secure=not request.META.get('HTTP_HOST', '').startswith('localhost'),  # Secure in production
                        samesite='Lax',
                        path='/api/auth/'
                    )

            return response

        except Ratelimited:
            return Response({
                'error': 'Too many login attempts. Please try again in a few minutes.',
                'details': 'Rate limit exceeded'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='3/m', method='POST', block=True)
def register_view(request):
    """
    Register a new vendor user.

    Expected payload:
    {
        "email": "vendor@example.com",
        "password": "securepassword123",
        "password_confirm": "securepassword123",
        "first_name": "John",
        "last_name": "Doe",
        "organization_name": "Optional Organization Name"
    }
    """
    serializer = UserRegistrationSerializer(data=request.data)

    try:
        if serializer.is_valid():
            try:
                user = serializer.save()

                # Return success response with user data
                user_serializer = UserSerializer(user)
                return Response({
                    'message': 'Registration successful! Please log in to continue.',
                    'user': user_serializer.data
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({
                    'error': 'Registration failed. Please try again.',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'error': 'Invalid registration data.',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Ratelimited:
        return Response({
            'error': 'Too many registration attempts. Please try again in a few minutes.',
            'details': 'Rate limit exceeded'
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)


@api_view(['POST'])
@ratelimit(key='ip', rate='10/m', method='POST', block=True)
def refresh_token_view(request):
    """
    Refresh access token using refresh token from httpOnly cookie or request body.
    Supports both cookie-based and body-based refresh tokens for flexibility.
    """
    try:
        # Try to get refresh token from cookie first, then from request body
        refresh_token = request.COOKIES.get('refresh_token') or request.data.get('refresh')

        if not refresh_token:
            return Response({
                'error': 'Refresh token is required.',
                'details': 'No refresh token found in cookie or request body'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Validate and refresh the token
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            # If rotation is enabled, get new refresh token
            new_refresh_token = str(refresh) if hasattr(refresh, 'rotate') else None

            response_data = {
                'access': access_token,
                'message': 'Token refreshed successfully'
            }

            response = Response(response_data, status=status.HTTP_200_OK)

            # If we have a new refresh token, set it as httpOnly cookie
            if new_refresh_token:
                response.set_cookie(
                    'refresh_token',
                    new_refresh_token,
                    max_age=7 * 24 * 60 * 60,  # 7 days
                    httponly=True,
                    secure=not request.META.get('HTTP_HOST', '').startswith('localhost'),
                    samesite='Lax',
                    path='/api/auth/'
                )

            return response

        except TokenError as e:
            return Response({
                'error': 'Invalid or expired refresh token.',
                'details': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)

    except Ratelimited:
        return Response({
            'error': 'Too many refresh attempts. Please try again in a few minutes.',
            'details': 'Rate limit exceeded'
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    except Exception as e:
        return Response({
            'error': 'Token refresh failed.',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@ratelimit(key='ip', rate='10/m', method='POST', block=True)
def logout_view(request):
    """
    Logout user by blacklisting the refresh token.
    Supports both cookie-based and body-based refresh tokens.
    """
    try:
        # Try to get refresh token from cookie first, then from request body
        refresh_token = request.COOKIES.get('refresh_token') or request.data.get('refresh')

        if not refresh_token:
            return Response({
                'error': 'Refresh token is required for logout.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Blacklist the refresh token
        token = RefreshToken(refresh_token)
        token.blacklist()

        # Create response
        response = Response({
            'message': 'Successfully logged out.'
        }, status=status.HTTP_200_OK)

        # Clear the refresh token cookie
        response.delete_cookie('refresh_token', path='/api/auth/')

        return response

    except Ratelimited:
        return Response({
            'error': 'Too many logout attempts. Please try again in a few minutes.',
            'details': 'Rate limit exceeded'
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    except Exception as e:
        return Response({
            'error': 'Logout failed.',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
