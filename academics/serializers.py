# academics/serializers.py
from rest_framework import serializers
from .models import SchoolYear, Grade, Subject, AcademicPeriod, Enrollment, TeacherAssignment
from users.serializers import UserSerializer

class SchoolYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolYear
        fields = '__all__'

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class AcademicPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicPeriod
        fields = '__all__'

class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    school_year_name = serializers.CharField(source='school_year.name', read_only=True)
    grade_id = serializers.IntegerField(source='grade.id', read_only=True)  # ← AGREGADO
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'student_username',
            'grade', 'grade_id', 'grade_name',  # ← grade_id agregado
            'school_year', 'school_year_name',
            'enrollment_date', 'is_active'
        ]
        read_only_fields = ['enrollment_date']

class TeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    school_year_name = serializers.CharField(source='school_year.name', read_only=True)
    grade_id = serializers.IntegerField(source='grade.id', read_only=True)  # ← AGREGADO
    
    class Meta:
        model = TeacherAssignment
        fields = [
            'id', 'teacher', 'teacher_name', 'grade', 'grade_id', 'grade_name',
            'subject', 'subject_name', 'school_year', 'school_year_name', 'is_active'
        ]