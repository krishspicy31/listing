from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class Category(models.Model):
    """
    Model representing event categories for organizing and filtering events.
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="The name of the category (e.g., 'Music', 'Dance', 'Festival')"
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        help_text="URL-friendly version of the name"
    )

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Event(models.Model):
    """
    Model representing cultural events submitted by vendors.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(
        max_length=200,
        help_text="The title of the event"
    )
    description = models.TextField(
        help_text="A detailed description of the event"
    )
    city = models.CharField(
        max_length=100,
        help_text="The city where the event will take place"
    )
    event_date = models.DateTimeField(
        help_text="The date and time of the event"
    )
    image_url = models.URLField(
        max_length=255,
        help_text="The URL of the event's image, hosted on Cloudinary"
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="The moderation status of the event"
    )

    # Relationships
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='events',
        help_text="The category this event belongs to"
    )
    vendor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='events',
        help_text="The vendor (user) who submitted this event"
    )

    class Meta:
        verbose_name = "Event"
        verbose_name_plural = "Events"
        ordering = ['-event_date']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['city']),
            models.Index(fields=['category']),
            models.Index(fields=['event_date']),
            models.Index(fields=['status', 'event_date']),  # Composite index for approved events ordered by date
            models.Index(fields=['status', 'city']),  # Composite index for city filtering on approved events
            models.Index(fields=['status', 'category']),  # Composite index for category filtering on approved events
        ]

    def __str__(self):
        return f"{self.title} - {self.city} ({self.event_date.strftime('%Y-%m-%d')})"
