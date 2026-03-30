# logs/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Log(models.Model):
    LOG_TYPES = [
        ('user', 'Usuario'),
        ('class', 'Clase'),
        ('grade', 'Calificación'),
        ('system', 'Sistema'),
        ('attendance', 'Asistencia'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='logs')
    action = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=LOG_TYPES, default='system')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Log'
        verbose_name_plural = 'Logs'
    
    def __str__(self):
        return f"{self.action} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"