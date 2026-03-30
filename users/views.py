from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import models
from .models import User, ParentStudent
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, 
    ParentStudentSerializer, CreateParentStudentSerializer
)
# users/views.py
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        role = serializer.validated_data.get('role', 'student')
        user = request.user if request.user.is_authenticated else None
        
        # Si NO está autenticado (registro público) → solo estudiante
        if not user or not user.is_authenticated:
            if role != 'student':
                return Response(
                    {"error": "Solo puedes registrarte como estudiante"},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer.validated_data['role'] = 'student'
            user_obj = serializer.save()
            
        # Si está autenticado (creado por admin desde interfaz)
        else:
            # Solo administradores pueden crear otros administradores
            if role == 'admin' and user.role != 'admin':
                return Response(
                    {"error": "Solo los administradores pueden crear otros administradores"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Profesores solo pueden crear estudiantes
            if user.role == 'teacher' and role != 'student':
                return Response(
                    {"error": "Los profesores solo pueden crear estudiantes"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Padres solo pueden crear estudiantes
            if user.role == 'parent' and role != 'student':
                return Response(
                    {"error": "Los acudientes solo pueden registrar estudiantes"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user_obj = serializer.save()
            
            # Si es administrador, establecer permisos
            if user_obj.role == 'admin':
                user_obj.is_staff = True
                user_obj.is_superuser = True
                user_obj.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'profile_picture': user.profile_picture.url if user.profile_picture else None,
                    'student_code': user.student_code if hasattr(user, 'student_code') else None
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        # No permitir cambiar el rol del usuario
        if 'role' in request.data:
            request.data.pop('role')
        return super().update(request, *args, **kwargs)

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Administradores ven todos los usuarios
        if user.role == 'admin':
            return User.objects.all()
        # Profesores ven solo sus estudiantes
        elif user.role == 'teacher':
            from academics.models import TeacherAssignment
            assignments = TeacherAssignment.objects.filter(teacher=user, is_active=True)
            grades = [a.grade_id for a in assignments]
            return User.objects.filter(
                role='student',
                enrollments__grade_id__in=grades,
                enrollments__is_active=True
            ).distinct()
        # Padres ven solo sus hijos
        elif user.role == 'parent':
            return User.objects.filter(
                role='student',
                parents__parent=user
            )
        # Estudiantes ven solo su perfil
        elif user.role == 'student':
            return User.objects.filter(id=user.id)
        
        return User.objects.none()

class MyChildrenView(generics.ListAPIView):
    serializer_class = ParentStudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'parent':
            return ParentStudent.objects.filter(parent=self.request.user)
        return ParentStudent.objects.none()

class MyParentsView(generics.ListAPIView):
    serializer_class = ParentStudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'student':
            return ParentStudent.objects.filter(student=self.request.user)
        return ParentStudent.objects.none()

class StudentEnrollmentsView(generics.ListAPIView):
    """Vista para que los estudiantes vean sus matrículas"""
    serializer_class = ParentStudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'student':
            return ParentStudent.objects.filter(student=self.request.user)
        return ParentStudent.objects.none()

class LinkParentStudentView(generics.CreateAPIView):
    serializer_class = CreateParentStudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        if request.user.role != 'parent':
            return Response(
                {"error": "Solo los acudientes pueden vincular estudiantes"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.validated_data['student_code']
        
        # Verificar que el estudiante no esté ya vinculado a este padre
        if ParentStudent.objects.filter(parent=request.user, student=student).exists():
            return Response(
                {"error": "Este estudiante ya está vinculado a tu cuenta"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        parent_student = ParentStudent.objects.create(
            parent=request.user,
            student=student,
            is_primary=not ParentStudent.objects.filter(parent=request.user).exists()
        )
        
        return Response(ParentStudentSerializer(parent_student).data, status=status.HTTP_201_CREATED)