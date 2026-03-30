from rest_framework import viewsets, permissions
from .models import UserLog
from .serializers import UserLogSerializer

class UserLogViewSet(viewsets.ModelViewSet):
    serializer_class = UserLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserLog.objects.all()  # <-- AGREGAR ESTA L?NEA
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return UserLog.objects.all()
        return UserLog.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)