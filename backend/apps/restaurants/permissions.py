from rest_framework.permissions import BasePermission


class IsRestaurantOwner(BasePermission):
    """Only restaurant owners can access this view."""
    message = "You must be a restaurant owner to perform this action."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'restaurant_owner'


class IsAdminUser(BasePermission):
    """Only admin users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'
