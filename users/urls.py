from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('list/', views.UserListView.as_view(), name='user-list'),
    path('my-children/', views.MyChildrenView.as_view(), name='my-children'),
    path('my-parents/', views.MyParentsView.as_view(), name='my-parents'),
    path('link-student/', views.LinkParentStudentView.as_view(), name='link-student'),
]