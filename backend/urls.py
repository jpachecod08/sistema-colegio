from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache

# Vista para configuración del sistema
class SettingsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        settings_data = cache.get('school_settings')
        if not settings_data:
            settings_data = {
                'school_name': 'Sistema Académico',
                'school_address': '',
                'school_phone': '',
                'school_email': '',
                'allow_registration': True,
                'allow_grade_editing': True,
                'grading_scale': '100',
                'min_grade': 60,
            }
        return Response(settings_data)
    
    def post(self, request):
        cache.set('school_settings', request.data, timeout=None)
        return Response(request.data)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/academics/', include('academics.urls')),
    path('api/grades/', include('grades.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/videocalls/', include('videocalls.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/logs/', include('logs.urls')),
    path('api/settings/', SettingsView.as_view(), name='settings'),  # ← Agrega esta línea
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)