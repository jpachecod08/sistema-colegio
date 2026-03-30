from django.db import models
from users.models import User

class SchoolYear(models.Model):
    name = models.CharField(max_length=20)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name

class Grade(models.Model):
    name = models.CharField(max_length=50)
    order = models.IntegerField()
    school_year = models.ForeignKey(SchoolYear, on_delete=models.CASCADE, related_name='grades')
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class AcademicPeriod(models.Model):
    name = models.CharField(max_length=20)
    period_number = models.IntegerField()
    school_year = models.ForeignKey(SchoolYear, on_delete=models.CASCADE, related_name='periods')
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['period_number']
    
    def __str__(self):
        return f"{self.school_year.name} - {self.name}"

class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments', limit_choices_to={'role': 'student'})
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='enrollments')
    school_year = models.ForeignKey(SchoolYear, on_delete=models.CASCADE)
    enrollment_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('student', 'school_year')
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.grade.name}"

class TeacherAssignment(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments', limit_choices_to={'role': 'teacher'})
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='teacher_assignments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_assignments')
    school_year = models.ForeignKey(SchoolYear, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('teacher', 'grade', 'subject', 'school_year')
    
    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.grade.name} - {self.subject.name}"