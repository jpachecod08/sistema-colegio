from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Attendance
from .serializers import AttendanceSerializer
from academics.models import TeacherAssignment, Enrollment

class AttendanceByDateView(generics.ListAPIView):
    """Obtener asistencia por fecha para el profesor"""
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        date = self.request.query_params.get('date', timezone.now().date())
        assignments = TeacherAssignment.objects.filter(teacher=self.request.user, is_active=True)
        return Attendance.objects.filter(
            teacher_assignment__in=assignments,
            date=date
        )

class MyAttendanceView(generics.ListAPIView):
    """Obtener mi propia asistencia (estudiante)"""
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Attendance.objects.filter(student=self.request.user)

class SaveAttendanceView(generics.CreateAPIView):
    """Guardar asistencia"""
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        records = request.data.get('records', [])
        teacher_assignment_id = request.data.get('teacher_assignment_id')
        
        if not records:
            return Response(
                {"error": "No se proporcionaron registros"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        saved_count = 0
        for record in records:
            try:
                attendance, created = Attendance.objects.update_or_create(
                    student_id=record['student_id'],
                    teacher_assignment_id=teacher_assignment_id,
                    date=record['date'],
                    defaults={'status': record['status']}
                )
                saved_count += 1
            except Exception as e:
                pass
        
        return Response({
            "status": "success",
            "saved_count": saved_count,
            "message": f"Se guardaron {saved_count} registros de asistencia"
        }, status=status.HTTP_200_OK)

class StudentsForAttendanceView(generics.ListAPIView):
    """Obtener estudiantes para tomar asistencia"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        teacher_assignment_id = request.query_params.get('teacher_assignment_id')
        date = request.query_params.get('date', timezone.now().date())
        
        if not teacher_assignment_id:
            return Response(
                {"error": "Se requiere teacher_assignment_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            teacher_assignment = TeacherAssignment.objects.get(
                id=teacher_assignment_id,
                teacher=request.user,
                is_active=True
            )
            
            # Obtener estudiantes del grado
            students = Enrollment.objects.filter(
                grade=teacher_assignment.grade,
                is_active=True
            ).select_related('student')
            
            # Obtener asistencia existente para estos estudiantes en esta fecha
            existing_attendance = Attendance.objects.filter(
                teacher_assignment=teacher_assignment,
                date=date,
                student__in=[e.student for e in students]
            )
            
            attendance_map = {a.student_id: a.status for a in existing_attendance}
            
            result = []
            for enrollment in students:
                result.append({
                    'student_id': enrollment.student.id,
                    'student_name': enrollment.student.get_full_name(),
                    'status': attendance_map.get(enrollment.student.id, '')
                })
            
            return Response({
                'date': date,
                'teacher_assignment_id': teacher_assignment_id,
                'subject': teacher_assignment.subject.name,
                'grade': teacher_assignment.grade.name,
                'students': result
            })
            
        except TeacherAssignment.DoesNotExist:
            return Response(
                {"error": "No tienes asignada esta materia"},
                status=status.HTTP_403_FORBIDDEN
            )
class AttendanceStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Asistencia de los últimos 30 días
            thirty_days_ago = timezone.now() - timedelta(days=30)
            
            total_attendances = Attendance.objects.filter(
                date__gte=thirty_days_ago
            ).count()
            
            present_attendances = Attendance.objects.filter(
                date__gte=thirty_days_ago,
                status='present'
            ).count()
            
            absent_attendances = Attendance.objects.filter(
                date__gte=thirty_days_ago,
                status='absent'
            ).count()
            
            late_attendances = Attendance.objects.filter(
                date__gte=thirty_days_ago,
                status='late'
            ).count()
            
            attendance_rate = 0
            if total_attendances > 0:
                attendance_rate = round((present_attendances / total_attendances) * 100)
            
            return Response({
                'total': total_attendances,
                'present': present_attendances,
                'absent': absent_attendances,
                'late': late_attendances,
                'rate': attendance_rate
            })
        except Exception as e:
            print(f"Error en attendance stats: {e}")
            return Response({
                'total': 0,
                'present': 0,
                'absent': 0,
                'late': 0,
                'rate': 0
            })