from rest_framework import serializers
from .models import UserLog

class UserLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserLog
        fields = ['id', 'user', 'username', 'action', 'details', 'ip_address', 'created_at']
        read_only_fields = ['id', 'created_at']
