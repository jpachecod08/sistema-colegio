from rest_framework import serializers
from .models import Activity, GradeRecord
from academics.serializers import TeacherAssignmentSerializer

class ActivitySerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='teacher_assignment.subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher_assignment.teacher.get_full_name', read_only=True)
    
    class Meta:
        model = Activity
        fields = ['id', 'teacher_assignment', 'subject_name', 'teacher_name', 'name', 
                  'percentage', 'academic_period', 'date']

class GradeRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    activity_name = serializers.CharField(source='activity.name', read_only=True)
    
    class Meta:
        model = GradeRecord
        fields = ['id', 'activity', 'activity_name', 'student', 'student_name', 'score']