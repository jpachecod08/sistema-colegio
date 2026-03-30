from rest_framework import serializers
from .models import VideoCall, CallParticipant, CallInvitation
from users.serializers import UserSerializer

class VideoCallSerializer(serializers.ModelSerializer):
    initiator_name = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoCall
        fields = ['id', 'title', 'description', 'call_type', 'status', 'initiator', 
                  'initiator_name', 'participants', 'participants_count', 'grade', 
                  'teacher_assignment', 'scheduled_time', 'duration_minutes', 
                  'max_participants', 'recording_enabled', 'created_at', 'updated_at']
        read_only_fields = ['channel_name', 'created_at', 'updated_at', 'status']
    
    def get_initiator_name(self, obj):
        return obj.initiator.get_full_name() if obj.initiator else ''
    
    def get_participants_count(self, obj):
        return obj.participants.count()

class CreateVideoCallSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoCall
        fields = ['title', 'description', 'call_type', 'scheduled_time', 'duration_minutes',
                  'max_participants', 'recording_enabled', 'grade', 'teacher_assignment']
    
    def validate(self, data):
        if data['call_type'] in ['class', 'parent_meeting'] and not data.get('grade'):
            raise serializers.ValidationError("Para reuniones de clase o padres, se requiere el grado")
        return data

class CallParticipantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = CallParticipant
        fields = ['id', 'call', 'user', 'user_name', 'status', 'joined_at', 'left_at', 'duration_seconds']

class CallInvitationSerializer(serializers.ModelSerializer):
    invited_user_name = serializers.CharField(source='invited_user.get_full_name', read_only=True)
    invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)
    
    class Meta:
        model = CallInvitation
        fields = ['id', 'call', 'invited_user', 'invited_user_name', 'invited_by', 
                  'invited_by_name', 'message', 'sent_at', 'response_at', 'response']