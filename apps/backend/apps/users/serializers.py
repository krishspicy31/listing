from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'role', 'organization_name', 'phone_number', 'website',
            'bio', 'avatar', 'city', 'country', 'is_verified', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_verified']


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with profile data."""
    profile = UserProfileSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'name', 'profile']
        read_only_fields = ['id']
    
    def get_name(self, obj):
        """Get display name for the user."""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        elif hasattr(obj, 'profile') and obj.profile.organization_name:
            return obj.profile.organization_name
        else:
            return obj.username


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        help_text="Password must be at least 8 characters long"
    )
    password_confirm = serializers.CharField(write_only=True)
    organization_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=200,
        help_text="Optional organization name"
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 
            'last_name', 'organization_name'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        """Validate email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_password(self, value):
        """Validate password meets Django's password requirements."""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate(self, attrs):
        """Validate password confirmation matches."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': "Password confirmation doesn't match password."
            })
        return attrs
    
    def create(self, validated_data):
        """Create user and associated profile."""
        # Remove password_confirm and organization_name from user data
        password_confirm = validated_data.pop('password_confirm')
        organization_name = validated_data.pop('organization_name', '')
        
        # Create user with email as username
        user = User.objects.create_user(
            username=validated_data['email'],  # Use email as username
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        # Create associated UserProfile with vendor role
        UserProfile.objects.create(
            user=user,
            role='vendor',  # Default role for new registrations
            organization_name=organization_name
        )
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer that includes user profile data."""
    
    def validate(self, attrs):
        """Validate credentials and return tokens with user data."""
        data = super().validate(attrs)
        
        # Add user profile data to the response
        user_serializer = UserSerializer(self.user)
        data['user'] = user_serializer.data
        
        return data
    
    @classmethod
    def get_token(cls, user):
        """Add custom claims to JWT token."""
        token = super().get_token(user)
        
        # Add user role to token claims
        try:
            token['role'] = user.profile.role
        except UserProfile.DoesNotExist:
            token['role'] = 'vendor'  # Default role
        
        # Add user name to token claims
        token['name'] = user.get_full_name() or user.username
        
        return token
