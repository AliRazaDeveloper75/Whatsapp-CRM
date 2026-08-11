from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CRMUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (("CRM", {"fields": ("role", "status", "phone_number")}),)
    list_display = ("username", "email", "role", "status", "is_staff")
    list_filter = ("role", "status", "is_staff")
