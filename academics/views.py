from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Q
from .models import SchoolYear, Grade, Subject, AcademicPeriod, Enrollment, TeacherAssignment
from .serializers import (
    SchoolYearSerializer, GradeSerializer, SubjectSerializer, 
    AcademicPeriodSerializer, EnrollmentSerializer, TeacherAssignmentSerializer
)

class SchoolYearViewSet(viewsets.ModelViewSet):
    queryset = SchoolYear.objects.all()
    serializer_class = SchoolYearSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        school_year = self.get_object()
        
        # Desactivar todos los años escolares
        SchoolYear.objects.filter(is_active=True).update(is_active=False)
        
        # Activar el seleccionado
        school_year.is_active = True
        school_year.save()
        
        return Response({'status': 'active', 'id': school_year.id})
    
    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        SchoolYear.objects.filter(is_active=True).update(is_active=False)
        school_year = self.get_object()
        school_year.is_active = True
        school_year.save()
        return Response({'status': 'active set'})

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [permissions.IsAuthenticated]

class TeacherAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TeacherAssignment.objects.all()
    serializer_class = TeacherAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_assignments(self, request):
        assignments = TeacherAssignment.objects.filter(teacher=request.user, is_active=True)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

class MyStudentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        assignments = TeacherAssignment.objects.filter(teacher=self.request.user)
        grades = [a.grade_id for a in assignments]
        return Enrollment.objects.filter(grade_id__in=grades, is_active=True)
    
class AcademicPeriodViewSet(viewsets.ModelViewSet):
    queryset = AcademicPeriod.objects.all()
    serializer_class = AcademicPeriodSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        period = self.get_object()
        
        # Desactivar todos los periodos del mismo año escolar
        AcademicPeriod.objects.filter(
            school_year=period.school_year,
            is_active=True
        ).update(is_active=False)
        
        # Activar el seleccionado
        period.is_active = True
        period.save()
        
        return Response({'status': 'active', 'id': period.id})

class GradesStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Calcular estadísticas de calificaciones
            all_grades = Grade.objects.filter(is_active=True)
            total_grades = all_grades.count()
            
            # Contar calificaciones aprobadas (>= 60)
            passing_grades = all_grades.filter(grade__gte=60).count()
            failing_grades = total_grades - passing_grades
            
            return Response({
                'total': total_grades,
                'passing': passing_grades,
                'failing': failing_grades
            })
        except Exception as e:
            return Response({'total': 0, 'passing': 0, 'failing': 0})
        
class MyAssignmentsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Verificar que el usuario es profesor
        if request.user.role != 'teacher':
            return Response(
                {"error": "Solo los profesores pueden ver sus asignaciones"},
                status=403
            )
        
        # Obtener asignaciones del profesor
        assignments = TeacherAssignment.objects.filter(
            teacher=request.user,
            is_active=True
        ).select_related('grade', 'subject')
        
        data = []
        for a in assignments:
            data.append({
                'id': a.id,
                'grade_id': a.grade.id,
                'grade_name': a.grade.name,
                'subject_id': a.subject.id,
                'subject_name': a.subject.name,
                'school_year_id': a.school_year.id,
                'school_year_name': a.school_year.name,
                'is_active': a.is_active
            })
        
        return Response(data)

# Agrega esto al final de academics/views.py, después de MyAssignmentsView

class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar matrículas de estudiantes
    """
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin ve todas las matrículas
        if user.role == 'admin':
            return Enrollment.objects.all().select_related('student', 'grade', 'school_year')
        
        # Profesor ve las matrículas de sus clases
        elif user.role == 'teacher':
            assignments = TeacherAssignment.objects.filter(teacher=user, is_active=True)
            grades = [a.grade_id for a in assignments]
            return Enrollment.objects.filter(grade_id__in=grades, is_active=True).select_related('student', 'grade', 'school_year')
        
        # Estudiante ve su propia matrícula
        elif user.role == 'student':
            return Enrollment.objects.filter(student=user, is_active=True).select_related('grade', 'school_year')
        
        # Padre ve las matrículas de sus hijos
        elif user.role == 'parent':
            from users.models import ParentStudent
            children = ParentStudent.objects.filter(parent=user).values_list('student_id', flat=True)
            return Enrollment.objects.filter(student_id__in=children, is_active=True).select_related('student', 'grade', 'school_year')
        
        return Enrollment.objects.none()
    
    def perform_create(self, serializer):
        # Verificar que no exista una matrícula duplicada
        student = serializer.validated_data.get('student')
        school_year = serializer.validated_data.get('school_year')
        
        if Enrollment.objects.filter(student=student, school_year=school_year).exists():
            raise serializers.ValidationError(
                {"detail": f"El estudiante ya está matriculado en el año escolar {school_year.name}"}
            )
        serializer.save()