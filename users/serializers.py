from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from .models import User, ParentStudent

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 
                  'role', 'phone', 'address', 'profile_picture', 'birth_date', 'is_active']
        read_only_fields = ['id', 'is_active', 'student_code']
    
    def get_full_name(self, obj):
        return obj.get_full_name()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    student_code = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 
                  'last_name', 'role', 'phone', 'address', 'birth_date', 'student_code']
    
    def validate(self, data):
        # Validar que las contraseñas coincidan
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        
        # Validar que el usuario no exista
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Este usuario ya existe"})
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Este email ya está registrado"})
        
        # Validar código de estudiante
        if data.get('role') == 'student' and data.get('student_code'):
            if User.objects.filter(student_code=data['student_code']).exists():
                raise serializers.ValidationError({"student_code": "Este código de estudiante ya está en uso"})
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        student_code = validated_data.pop('student_code', None)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'student'),
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            birth_date=validated_data.get('birth_date')
        )
        
        if student_code:
            user.student_code = student_code
            user.save()
        
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Credenciales inválidas")

class ParentStudentSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.get_full_name', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = ParentStudent
        fields = ['id', 'parent', 'parent_name', 'student', 'student_name', 'is_primary']

class CreateParentStudentSerializer(serializers.Serializer):
    student_code = serializers.CharField()
    
    def validate_student_code(self, value):
        try:
            student = User.objects.get(student_code=value, role='student', is_active=True)
            return student
        except User.DoesNotExist:
            raise serializers.ValidationError("Código de estudiante inválido")