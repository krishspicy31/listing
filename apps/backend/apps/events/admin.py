from django.contrib import admin
from .models import Category, Event


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin configuration for Category model."""
    list_display = ['name', 'slug']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Admin configuration for Event model."""
    list_display = ['title', 'city', 'event_date', 'status', 'category', 'vendor']
    list_filter = ['status', 'category', 'event_date', 'city']
    search_fields = ['title', 'description', 'city']
    date_hierarchy = 'event_date'
    ordering = ['-event_date']
    readonly_fields = ['vendor']

    fieldsets = (
        ('Event Information', {
            'fields': ('title', 'description', 'category')
        }),
        ('Location & Date', {
            'fields': ('city', 'event_date')
        }),
        ('Media', {
            'fields': ('image_url',)
        }),
        ('Status & Vendor', {
            'fields': ('status', 'vendor')
        }),
    )

    def save_model(self, request, obj, form, change):
        """Auto-assign the current user as vendor if creating new event."""
        if not change:  # Only for new objects
            obj.vendor = request.user
        super().save_model(request, obj, form, change)
