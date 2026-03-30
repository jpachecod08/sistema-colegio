# logs/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('recent/', views.RecentActivityView.as_view(), name='recent-activity'),
]