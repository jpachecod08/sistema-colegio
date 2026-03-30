from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserLogViewSet.as_view({'get': 'list', 'post': 'create'}), name='logs-list'),
    path('<int:pk>/', views.UserLogViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='logs-detail'),
]