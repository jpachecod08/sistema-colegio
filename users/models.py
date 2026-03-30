from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from phonenumber_field.modelfields import PhoneNumberField

class User(AbstractUser):
    ROLES = (
        ('admin', 'Administrador'),
        ('teacher', 'Profesor'),
        ('student', 'Estudiante'),
        ('parent', 'Acudiente'),
    )
    
    role = models.CharField(max_length=20, choices=ROLES, default='student')
    phone = PhoneNumberField(blank=True, null=True)
    address = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Campos para relación padre-hijo
    student_code = models.CharField(max_length=20, blank=True, null=True, unique=True)
    parent_code = models.CharField(max_length=20, blank=True, null=True)
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        permissions = [
            ("can_create_teacher", "Puede crear profesores"),
            ("can_create_student", "Puede crear estudiantes"),
            ("can_create_parent", "Puede crear acudientes"),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} - {self.get_role_display()}"
    
    def clean(self):
        super().clean()
        # Validar que los códigos sean únicos según el rol
        if self.role == 'student' and self.student_code:
            if User.objects.filter(student_code=self.student_code).exclude(id=self.id).exists():
                raise ValidationError({'student_code': 'Este código de estudiante ya está en uso'})
    
    def save(self, *args, **kwargs):
        if self.role == 'student' and not self.student_code:
            # Generar código automático para estudiantes
            import uuid
            self.student_code = f"EST-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

class ParentStudent(models.Model):
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='children', limit_choices_to={'role': 'parent'})
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parents', limit_choices_to={'role': 'student'})
    is_primary = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('parent', 'student')
        verbose_name = 'Relación Padre-Estudiante'
    
    def __str__(self):
        return f"{self.parent.get_full_name()} -> {self.student.get_full_name()}"