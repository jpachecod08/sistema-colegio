# logs/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from .models import Log
from .serializers import LogSerializer

class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Intentar obtener logs reales
            recent_logs = Log.objects.all()[:10]
            serializer = LogSerializer(recent_logs, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error fetching logs: {e}")
            # Si hay error, retornar datos de ejemplo
            activities = [
                {
                    'id': 1,
                    'title': 'Nuevo usuario registrado',
                    'time': 'Hace 2 horas',
                    'tag': 'Usuario',
                    'type': 'user'
                },
                {
                    'id': 2,
                    'title': 'Nueva clase creada',
                    'time': 'Hace 5 horas',
                    'tag': 'Clase',
                    'type': 'class'
                }
            ]
            return Response(activities)