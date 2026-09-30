from django.contrib import admin
from apps.models import User, Lead, LeadActivity


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'department', 'is_active']
    list_filter = ['role', 'is_active', 'department']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'status', 'source', 'priority', 'assigned_to', 'created_at']
    list_filter = ['status', 'source', 'priority', 'created_at']
    search_fields = ['name', 'email', 'phone', 'company']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'

    list_editable = ['status', 'priority']
    autocomplete_fields = ['assigned_to']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(LeadActivity)
class LeadActivityAdmin(admin.ModelAdmin):
    list_display = ['lead', 'activity_type', 'title', 'user', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['title', 'description', 'lead__name','user__email']
    ordering = ['-created_at']

    autocomplete_fields = ['lead', 'user']
    readonly_fields = ['created_at', 'updated_at']
