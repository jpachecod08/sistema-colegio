# logs/serializers.py
from rest_framework import serializers
from .models import Log
from django.utils import timezone

class LogSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    tag = serializers.SerializerMethodField()
    
    class Meta:
        model = Log
        fields = ['id', 'title', 'time', 'tag', 'type']
    
    def get_title(self, obj):
        return obj.action
    
    def get_time(self, obj):
        delta = timezone.now() - obj.created_at
        
        if delta.days > 0:
            return f'Hace {delta.days} días'
        elif delta.seconds > 3600:
            hours = delta.seconds // 3600
            return f'Hace {hours} horas'
        elif delta.seconds > 60:
            minutes = delta.seconds // 60
            return f'Hace {minutes} minutos'
        else:
            return 'Ahora'
    
    def get_tag(self, obj):
        tags = {
            'user': 'Usuario',
            'class': 'Clase',
            'grade': 'Calificación',
            'system': 'Sistema',
            'attendance': 'Asistencia',
        }
        return tags.get(obj.type, 'Sistema')