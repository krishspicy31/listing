from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.register_view, name='auth_register'),
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/refresh/', views.refresh_token_view, name='auth_refresh'),  # Custom refresh view with cookie support
    path('auth/logout/', views.logout_view, name='auth_logout'),
]
