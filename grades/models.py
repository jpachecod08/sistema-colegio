from django.db import models
from users.models import User
from academics.models import TeacherAssignment, AcademicPeriod

class Activity(models.Model):
    teacher_assignment = models.ForeignKey(TeacherAssignment, on_delete=models.CASCADE, related_name='activities')
    name = models.CharField(max_length=200)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    academic_period = models.ForeignKey(AcademicPeriod, on_delete=models.CASCADE)
    date = models.DateField()
    
    def __str__(self):
        return f"{self.name} ({self.percentage}%)"

class GradeRecord(models.Model):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='grades')
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'})
    score = models.DecimalField(max_digits=5, decimal_places=2)
    
    class Meta:
        unique_together = ('activity', 'student')
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.activity.name}"