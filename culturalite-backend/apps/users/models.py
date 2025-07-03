from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


class UserProfile(models.Model):
    """
    Extended user profile model for vendors and admins.
    OneToOne relationship with Django's built-in User model.
    """

    # Role choices for user types
    ROLE_CHOICES = [
        ('vendor', 'Vendor'),
        ('admin', 'Admin'),
    ]

    # Core relationship
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        help_text="Link to Django's built-in User model"
    )

    # Role field for user type
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='vendor',
        help_text="User role: vendor can submit events, admin can moderate"
    )

    # Organization details
    organization_name = models.CharField(
        max_length=200,
        blank=True,
        help_text="Name of the organization or business"
    )

    # Contact information
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        help_text="Contact phone number"
    )
    website = models.URLField(
        blank=True,
        help_text="Organization website URL"
    )

    # Profile details
    bio = models.TextField(
        max_length=1000,
        blank=True,
        help_text="Brief description about the organizer or organization"
    )
    avatar = models.URLField(
        blank=True,
        help_text="Profile picture URL (stored in Cloudinary)"
    )

    # Location
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)

    # Status
    is_verified = models.BooleanField(
        default=False,
        help_text="Whether the organizer has been verified by platform admins"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.role})"

    @property
    def display_name(self):
        """Return the best available display name for the user."""
        if self.user.first_name and self.user.last_name:
            return f"{self.user.first_name} {self.user.last_name}"
        elif self.organization_name:
            return self.organization_name
        else:
            return self.user.username
