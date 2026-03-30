from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
import uuid
from .models import VideoCall, CallParticipant, CallInvitation
from .serializers import VideoCallSerializer, CreateVideoCallSerializer, CallParticipantSerializer
from academics.models import TeacherAssignment, Enrollment
from users.models import User
from users.serializers import UserSerializer

class VideoCallViewSet(viewsets.ModelViewSet):
    queryset = VideoCall.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateVideoCallSerializer
        return VideoCallSerializer
    
    def perform_create(self, serializer):
        channel_name = f"call_{uuid.uuid4().hex[:16]}"
        
        call = serializer.save(
            initiator=self.request.user,
            channel_name=channel_name,
            status='scheduled'
        )
        
        CallParticipant.objects.create(
            call=call,
            user=self.request.user,
            status='joined'
        )
        
        return call
    
    @action(detail=True, methods=['post'])
    def join_call(self, request, pk=None):
        call = self.get_object()
        
        if call.status != 'ongoing':
            return Response(
                {"error": "La llamada no está activa"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participant, created = CallParticipant.objects.get_or_create(
            call=call,
            user=request.user,
            defaults={'status': 'joined'}
        )
        
        if not created and participant.status == 'rejected':
            return Response(
                {"error": "No puedes unirte a esta llamada"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        participant.status = 'joined'
        participant.joined_at = timezone.now()
        participant.save()
        
        # Usar Jitsi Meet
        room_name = f"SistemaAcademico-{call.channel_name}"
        join_url = f"https://meet.jit.si/{room_name}"
        
        return Response({
            'join_url': join_url,
            'channel_name': call.channel_name,
            'call_id': call.id,
            'room_name': room_name
        })
    
    @action(detail=True, methods=['post'])
    def start_call(self, request, pk=None):
        call = self.get_object()
        
        if request.user != call.initiator:
            return Response(
                {"error": "Solo el iniciador puede comenzar la llamada"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if call.status != 'scheduled':
            return Response(
                {"error": "La llamada ya está en curso o finalizada"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        call.status = 'ongoing'
        call.start_time = timezone.now()
        call.save()
        
        return Response({"status": "Llamada iniciada"})
    
    @action(detail=True, methods=['post'])
    def end_call(self, request, pk=None):
        call = self.get_object()
        
        if request.user != call.initiator:
            return Response(
                {"error": "Solo el iniciador puede finalizar la llamada"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        call.status = 'ended'
        call.end_time = timezone.now()
        call.save()
        
        return Response({"status": "Llamada finalizada"})
    
    @action(detail=True, methods=['post'])
    def invite_participants(self, request, pk=None):
        call = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        if not user_ids:
            return Response(
                {"error": "No se proporcionaron usuarios"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invitations = []
        for user_id in user_ids:
            try:
                invited_user = User.objects.get(id=user_id)
                invitation = CallInvitation.objects.create(
                    call=call,
                    invited_user=invited_user,
                    invited_by=request.user
                )
                invitations.append(invitation)
            except User.DoesNotExist:
                continue
        
        return Response({"invitations_sent": len(invitations)})
    
    @action(detail=False, methods=['get'])
    def my_calls(self, request):
        upcoming = VideoCall.objects.filter(
            participants=request.user,
            status='scheduled',
            scheduled_time__gte=timezone.now()
        ).order_by('scheduled_time')
        
        past = VideoCall.objects.filter(
            participants=request.user,
            status__in=['ended', 'cancelled']
        ).order_by('-scheduled_time')
        
        return Response({
            'upcoming': VideoCallSerializer(upcoming, many=True).data,
            'past': VideoCallSerializer(past, many=True).data
        })
    
    @action(detail=False, methods=['get'])
    def available_participants(self, request):
        user = request.user
        
        if user.role == 'teacher':
            assignments = TeacherAssignment.objects.filter(teacher=user, is_active=True)
            grades = [a.grade_id for a in assignments]
            students = User.objects.filter(
                role='student',
                enrollments__grade_id__in=grades,
                enrollments__is_active=True
            ).distinct()
            serializer = UserSerializer(students, many=True)
            return Response(serializer.data)
        
        elif user.role == 'admin':
            users = User.objects.filter(is_active=True).exclude(id=user.id)
            serializer = UserSerializer(users, many=True)
            return Response(serializer.data)
        
        return Response([])