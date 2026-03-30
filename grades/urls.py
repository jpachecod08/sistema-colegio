from django.urls import path
from . import views

urlpatterns = [
    path('my-activities/', views.MyActivitiesView.as_view(), name='my-activities'),
    path('my-class-grades/', views.MyClassGradesView.as_view(), name='my-class-grades'),
    path('my-grades/', views.MyGradesView.as_view(), name='my-grades'),
    path('save/', views.SaveGradeView.as_view(), name='save-grade'),
    path('report-card/', views.report_card, name='report-card'),
    path('stats/', views.GradesStatsView.as_view(), name='grades-stats'),
    path('activities/', views.ActivityListView.as_view(), name='activity-list'),
    path('activities/create/', views.CreateActivityView.as_view(), name='create-activity'), 
]