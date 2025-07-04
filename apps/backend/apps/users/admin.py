from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    """Inline admin for UserProfile to show with User admin."""
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = (
        'role', 'organization_name', 'phone_number', 'website',
        'bio', 'avatar', 'city', 'country', 'is_verified'
    )


class UserAdmin(BaseUserAdmin):
    """Extended User admin with UserProfile inline."""
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_role', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'profile__role', 'profile__is_verified')

    def get_role(self, obj):
        """Get user role from profile."""
        try:
            return obj.profile.role
        except UserProfile.DoesNotExist:
            return 'No Profile'
    get_role.short_description = 'Role'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin interface for UserProfile model."""
    list_display = ('user', 'role', 'organization_name', 'city', 'is_verified', 'created_at')
    list_filter = ('role', 'is_verified', 'city', 'country', 'created_at')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'organization_name')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('User Information', {
            'fields': ('user', 'role')
        }),
        ('Organization Details', {
            'fields': ('organization_name', 'phone_number', 'website', 'bio', 'avatar')
        }),
        ('Location', {
            'fields': ('city', 'country')
        }),
        ('Status', {
            'fields': ('is_verified',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
