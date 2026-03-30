from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.db.models import Q, Sum, Avg
from .models import Activity, GradeRecord
from .serializers import ActivitySerializer, GradeRecordSerializer
from academics.models import TeacherAssignment, Enrollment

class MyActivitiesView(generics.ListAPIView):
    """Obtener actividades del profesor"""
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        assignments = TeacherAssignment.objects.filter(teacher=self.request.user, is_active=True)
        period_id = self.request.query_params.get('period_id')
        queryset = Activity.objects.filter(teacher_assignment__in=assignments)
        
        if period_id:
            queryset = queryset.filter(academic_period_id=period_id)
        
        return queryset

class MyClassGradesView(generics.ListAPIView):
    """Obtener calificaciones de la clase del profesor"""
    serializer_class = GradeRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        assignments = TeacherAssignment.objects.filter(teacher=self.request.user, is_active=True)
        activities = Activity.objects.filter(teacher_assignment__in=assignments)
        return GradeRecord.objects.filter(activity__in=activities)
class MyGradesView(generics.GenericAPIView):
    """Obtener mis calificaciones con actividades (estudiante)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'student':
            return Response({"error": "Solo estudiantes"}, status=403)
        
        # Obtener matrícula
        from academics.models import Enrollment, TeacherAssignment
        
        enrollment = Enrollment.objects.filter(student=request.user, is_active=True).first()
        if not enrollment:
            return Response([])
        
        # Obtener asignaciones del grado
        assignments = TeacherAssignment.objects.filter(grade=enrollment.grade, is_active=True)
        
        # Obtener todas las actividades
        activities = Activity.objects.filter(teacher_assignment__in=assignments).select_related('teacher_assignment__subject')
        
        # Obtener calificaciones existentes
        grades = GradeRecord.objects.filter(student=request.user)
        grades_dict = {g.activity_id: g.score for g in grades}
        
        # Construir respuesta
        result = []
        for activity in activities:
            result.append({
                'id': activity.id,
                'name': activity.name,
                'percentage': float(activity.percentage),
                'subject_name': activity.teacher_assignment.subject.name,
                'subject_id': activity.teacher_assignment.subject.id,
                'score': grades_dict.get(activity.id, None),
                'date': activity.date,
            })
        
        return Response(result)

class SaveGradeView(generics.CreateAPIView):
    """Guardar calificación"""
    serializer_class = GradeRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        student_id = request.data.get('student_id')
        activity_id = request.data.get('activity_id')
        score = request.data.get('score')
        
        if not all([student_id, activity_id, score is not None]):
            return Response(
                {"error": "Faltan campos requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que el profesor tiene permiso para calificar a este estudiante
        try:
            activity = Activity.objects.get(id=activity_id)
            teacher_assignments = TeacherAssignment.objects.filter(
                teacher=request.user,
                subject=activity.teacher_assignment.subject,
                grade=activity.teacher_assignment.grade,
                is_active=True
            )
            
            if not teacher_assignments.exists():
                return Response(
                    {"error": "No tienes permiso para calificar esta actividad"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Activity.DoesNotExist:
            return Response(
                {"error": "Actividad no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        grade, created = GradeRecord.objects.update_or_create(
            student_id=student_id,
            activity_id=activity_id,
            defaults={'score': score}
        )
        
        return Response(GradeRecordSerializer(grade).data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def report_card(request):
    """Generar boletín de calificaciones"""
    user = request.user
    period_id = request.GET.get('period_id')
    student_id = request.GET.get('student_id')
    
    # Determinar el estudiante objetivo
    if user.role == 'parent' and student_id:
        from users.models import ParentStudent
        parent_student = ParentStudent.objects.filter(parent=user, student_id=student_id).first()
        if not parent_student:
            return Response({"error": "No tienes acceso a este estudiante"}, status=403)
        target_user = parent_student.student
    elif user.role == 'student':
        target_user = user
    elif user.role == 'teacher':
        return Response({"error": "Los profesores no tienen boletín"}, status=403)
    else:
        return Response({"error": "No autorizado"}, status=403)
    
    # Obtener matrícula del estudiante
    enrollment = Enrollment.objects.filter(student=target_user, is_active=True).first()
    if not enrollment:
        return Response({"error": "Estudiante no matriculado"}, status=404)
    
    # Obtener asignaturas del grado
    assignments = TeacherAssignment.objects.filter(grade=enrollment.grade, is_active=True)
    
    # Obtener actividades y calificaciones
    activities = Activity.objects.filter(teacher_assignment__in=assignments)
    if period_id:
        activities = activities.filter(academic_period_id=period_id)
    
    subjects_data = []
    for assignment in assignments:
        subject_activities = activities.filter(teacher_assignment=assignment)
        subject_grades = []
        total_score = 0
        total_percentage = 0
        
        for activity in subject_activities:
            grade = GradeRecord.objects.filter(activity=activity, student=target_user).first()
            score = float(grade.score) if grade and grade.score else None
            subject_grades.append({
                'activity_name': activity.name,
                'percentage': float(activity.percentage),
                'score': score
            })
            if score:
                total_score += score * (float(activity.percentage) / 100)
                total_percentage += float(activity.percentage)
        
        final_score = (total_score / total_percentage * 100) if total_percentage > 0 else None
        
        subjects_data.append({
            'subject_id': assignment.subject.id,
            'subject_name': assignment.subject.name,
            'activities': subject_grades,
            'final_score': final_score,
            'status': 'APROBADO' if final_score and final_score >= 60 else 'REPROBADO' if final_score else 'PENDIENTE'
        })
    
    return Response({
        'student_name': target_user.get_full_name(),
        'grade': enrollment.grade.name,
        'academic_year': enrollment.school_year.name,
        'subjects': subjects_data,
        'generated_at': timezone.now()
    })
class GradesStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Usar GradeRecord en lugar de Grade
            all_grades = GradeRecord.objects.filter(score__isnull=False)
            total_grades = all_grades.count()
            
            if total_grades > 0:
                # Calificaciones aprobadas (score >= 60)
                passing_grades = all_grades.filter(score__gte=60).count()
                failing_grades = total_grades - passing_grades
                # Promedio de calificaciones
                average_grade = all_grades.aggregate(models.Avg('score'))['score__avg'] or 0
            else:
                passing_grades = 0
                failing_grades = 0
                average_grade = 0
            
            return Response({
                'total': total_grades,
                'passing': passing_grades,
                'failing': failing_grades,
                'average': round(average_grade, 1)
            })
        except Exception as e:
            print(f"Error en grades stats: {e}")
            return Response({
                'total': 0,
                'passing': 0,
                'failing': 0,
                'average': 0
            })
class CreateActivityView(generics.CreateAPIView):
    """Crear una nueva actividad"""
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        print("Datos recibidos en backend:", request.data)  # Debug
        
        # Verificar que el usuario es profesor
        if request.user.role != 'teacher':
            return Response(
                {"error": "Solo los profesores pueden crear actividades"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que se envió teacher_assignment_id
        teacher_assignment_id = request.data.get('teacher_assignment_id')
        if not teacher_assignment_id:
            return Response(
                {"teacher_assignment": ["Este campo es requerido."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que la asignación pertenece al profesor
        try:
            assignment = TeacherAssignment.objects.get(
                id=teacher_assignment_id,
                teacher=request.user,
                is_active=True
            )
        except TeacherAssignment.DoesNotExist:
            return Response(
                {"error": "No tienes permiso para crear actividades en esta clase"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar que se envió academic_period
        academic_period_id = request.data.get('academic_period')
        if not academic_period_id:
            return Response(
                {"academic_period": ["Este campo es requerido."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Preparar los datos para el serializador
        data = {
            'name': request.data.get('name'),
            'percentage': request.data.get('percentage'),
            'date': request.data.get('date'),
            'teacher_assignment': teacher_assignment_id,
            'academic_period': academic_period_id,
        }
        
        serializer = self.get_serializer(data=data)
        
        if not serializer.is_valid():
            print("Errores de validación:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class ActivityListView(generics.ListAPIView):
    """Listar actividades (para admin)"""
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Activity.objects.all()
        elif user.role == 'teacher':
            assignments = TeacherAssignment.objects.filter(teacher=user, is_active=True)
            return Activity.objects.filter(teacher_assignment__in=assignments)
        return Activity.objects.none()