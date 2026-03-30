from django.db import models
from users.models import User
from academics.models import TeacherAssignment

class Attendance(models.Model):
    STATUS = (
        ('present', 'Presente'),
        ('absent', 'Ausente'),
        ('late', 'Tarde'),
    )
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    teacher_assignment = models.ForeignKey(TeacherAssignment, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS)
    
    class Meta:
        unique_together = ('student', 'teacher_assignment', 'date')
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.date} - {self.get_status_display()}"