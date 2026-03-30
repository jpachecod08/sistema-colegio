from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'school-years', views.SchoolYearViewSet, basename='schoolyear')
router.register(r'grades', views.GradeViewSet, basename='grade')
router.register(r'subjects', views.SubjectViewSet, basename='subject')
router.register(r'academic-periods', views.AcademicPeriodViewSet, basename='academicperiod')
router.register(r'teacher-assignments', views.TeacherAssignmentViewSet, basename='teacherassignment')
router.register(r'enrollments', views.EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    path('my-students/', views.MyStudentsView.as_view(), name='my-students'),
    path('my-assignments/', views.TeacherAssignmentViewSet.as_view({'get': 'my_assignments'}), name='my-assignments'),
]