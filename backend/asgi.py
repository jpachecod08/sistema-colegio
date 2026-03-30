import os
from django.core.asgi import get_asgi_application

# PRIMERO: Configurar Django ANTES de importar cualquier cosa
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# SEGUNDO: Inicializar la aplicación Django
django_asgi_app = get_asgi_application()

# TERCERO: Ahora importar channels (después de que Django esté listo)
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from videocalls import consumers

# CUARTO: Crear la aplicación con websockets
application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter([
            path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
        ])
    ),
})