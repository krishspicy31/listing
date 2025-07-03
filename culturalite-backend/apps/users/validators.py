"""
Custom password validators for enhanced security requirements.
Implements the story requirements: minimum 8 characters, uppercase, lowercase, number.
"""

import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class CustomPasswordValidator:
    """
    Custom password validator that enforces:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter  
    - At least one number
    """
    
    def validate(self, password, user=None):
        """Validate password meets all requirements."""
        errors = []
        
        # Check minimum length
        if len(password) < 8:
            errors.append(_("Password must be at least 8 characters long."))
        
        # Check for uppercase letter
        if not re.search(r'[A-Z]', password):
            errors.append(_("Password must contain at least one uppercase letter."))
        
        # Check for lowercase letter
        if not re.search(r'[a-z]', password):
            errors.append(_("Password must contain at least one lowercase letter."))
        
        # Check for number
        if not re.search(r'\d', password):
            errors.append(_("Password must contain at least one number."))
        
        if errors:
            raise ValidationError(errors)
    
    def get_help_text(self):
        """Return help text for password requirements."""
        return _(
            "Your password must be at least 8 characters long and contain "
            "at least one uppercase letter, one lowercase letter, and one number."
        )


class NoCommonPasswordValidator:
    """
    Validator that prevents use of common passwords.
    Enhanced version of Django's CommonPasswordValidator.
    """
    
    COMMON_PASSWORDS = {
        'password', 'password123', '123456', '123456789', 'qwerty',
        'abc123', 'password1', 'admin', 'letmein', 'welcome',
        'monkey', '1234567890', 'dragon', 'master', 'hello',
        'login', 'pass', 'admin123', 'root', 'user'
    }
    
    def validate(self, password, user=None):
        """Check if password is in common passwords list."""
        if password.lower() in self.COMMON_PASSWORDS:
            raise ValidationError(
                _("This password is too common. Please choose a more secure password."),
                code='password_too_common',
            )
    
    def get_help_text(self):
        """Return help text for common password validation."""
        return _("Your password can't be a commonly used password.")


class UserAttributeSimilarityValidator:
    """
    Validator that prevents passwords too similar to user information.
    Enhanced version that checks against email, first name, last name, and organization.
    """
    
    def __init__(self, user_attributes=None, max_similarity=0.7):
        self.user_attributes = user_attributes or ['username', 'first_name', 'last_name', 'email']
        self.max_similarity = max_similarity
    
    def validate(self, password, user=None):
        """Check password similarity to user attributes."""
        if not user:
            return
        
        password_lower = password.lower()
        
        # Check against user attributes
        for attribute_name in self.user_attributes:
            value = getattr(user, attribute_name, None)
            if not value:
                continue
            
            value_lower = value.lower()
            
            # Check if password contains significant portion of attribute
            if len(value_lower) >= 3 and value_lower in password_lower:
                raise ValidationError(
                    _("The password is too similar to your %(verbose_name)s."),
                    code='password_too_similar',
                    params={'verbose_name': attribute_name.replace('_', ' ')},
                )
            
            # Check if attribute contains significant portion of password
            if len(password_lower) >= 3 and password_lower in value_lower:
                raise ValidationError(
                    _("The password is too similar to your %(verbose_name)s."),
                    code='password_too_similar',
                    params={'verbose_name': attribute_name.replace('_', ' ')},
                )
        
        # Check against profile organization name if available
        if hasattr(user, 'profile') and user.profile.organization_name:
            org_name = user.profile.organization_name.lower()
            if len(org_name) >= 3 and (org_name in password_lower or password_lower in org_name):
                raise ValidationError(
                    _("The password is too similar to your organization name."),
                    code='password_too_similar',
                )
    
    def get_help_text(self):
        """Return help text for similarity validation."""
        return _("Your password can't be too similar to your other personal information.")
