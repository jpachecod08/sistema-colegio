from django.contrib import admin
from .models import UserLog

@admin.register(UserLog)
class UserLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'ip_address', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['user__username', 'details']
    readonly_fields = ['user', 'action', 'details', 'ip_address', 'created_at']
