import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from users.models import User

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        
        if self.user and not isinstance(self.user, AnonymousUser):
            self.group_name = f'user_{self.user.id}'
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'ping':
            await self.send(text_data=json.dumps({
                'type': 'pong',
                'message': 'Connection alive'
            }))
    
    async def call_notification(self, event):
        """Enviar notificación de videollamada"""
        await self.send(text_data=json.dumps({
            'type': 'call_notification',
            'event': event['event'],
            'call_id': event.get('call_id'),
            'call_title': event.get('call_title'),
            'data': event.get('data', {})
        }))