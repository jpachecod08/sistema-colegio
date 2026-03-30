from django.urls import path
from . import views

urlpatterns = [
    path('by-date/', views.AttendanceByDateView.as_view(), name='attendance-by-date'),
    path('my-attendance/', views.MyAttendanceView.as_view(), name='my-attendance'),
    path('save/', views.SaveAttendanceView.as_view(), name='save-attendance'),
    path('students/', views.StudentsForAttendanceView.as_view(), name='students-for-attendance'),
     path('stats/', views.AttendanceStatsView.as_view(), name='attendance-stats'),
]