from django.db import models
from users.models import User
from academics.models import Grade, TeacherAssignment

class VideoCall(models.Model):
    CALL_TYPES = (
        ('private', 'Privada'),
        ('class', 'Clase'),
        ('parent_meeting', 'Reunión de Padres'),
    )
    
    STATUS = (
        ('scheduled', 'Agendada'),
        ('ongoing', 'En Curso'),
        ('ended', 'Finalizada'),
        ('cancelled', 'Cancelada'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    call_type = models.CharField(max_length=20, choices=CALL_TYPES)
    status = models.CharField(max_length=20, choices=STATUS, default='scheduled')
    
    initiator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='initiated_calls')
    participants = models.ManyToManyField(User, related_name='video_calls')
    
    grade = models.ForeignKey(Grade, on_delete=models.SET_NULL, null=True, blank=True)
    teacher_assignment = models.ForeignKey(TeacherAssignment, on_delete=models.SET_NULL, null=True, blank=True)
    
    channel_name = models.CharField(max_length=255, unique=True, null=True, blank=True)
    scheduled_time = models.DateTimeField()
    duration_minutes = models.IntegerField(default=30)
    max_participants = models.IntegerField(default=50)
    recording_enabled = models.BooleanField(default=False)
    
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-scheduled_time']
    
    def __str__(self):
        return f"{self.title} - {self.scheduled_time}"

class CallParticipant(models.Model):
    PARTICIPANT_STATUS = (
        ('invited', 'Invitado'),
        ('joined', 'Unido'),
        ('left', 'Abandonó'),
        ('rejected', 'Rechazó'),
    )
    
    call = models.ForeignKey(VideoCall, on_delete=models.CASCADE, related_name='participant_details')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=PARTICIPANT_STATUS, default='invited')
    joined_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('call', 'user')
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.call.title}"

class CallInvitation(models.Model):
    call = models.ForeignKey(VideoCall, on_delete=models.CASCADE, related_name='invitations')
    invited_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invitations')
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    message = models.TextField(blank=True)
    sent_at = models.DateTimeField(auto_now_add=True)
    response_at = models.DateTimeField(null=True, blank=True)
    response = models.CharField(max_length=20, blank=True)  # accepted, declined
    
    def __str__(self):
        return f"Invitation to {self.invited_user.get_full_name()} for {self.call.title}"