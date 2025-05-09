from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/create/', views.UserCreateView.as_view(), name='user-create'),
    path('users/<str:user_id>/', views.UserDetailView.as_view(), name='user-detail'),
    path('health/', views.HealthCheckView.as_view(), name='health-check'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('attendance/', views.AttendanceAPI.as_view(), name='attendance'),
    
    # Adding new endpoints for dashboard
    path('user/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('attendance/all/', views.AttendanceListView.as_view(), name='attendance-list'),
    path('attendance/user/<int:user_id>/', views.UserAttendanceView.as_view(), name='user-attendance'),
    
    # User management endpoints
    path('user/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # Class and Schedule endpoints
    path('classes/', views.ClassListView.as_view(), name='class-list'),
    path('classes/instructor/<str:instructor_id>/', views.ClassListView.as_view(), name='instructor-classes'),
    path('schedules/', views.ScheduleListView.as_view(), name='schedule-list'),
    path('schedules/instructor/<str:instructor_id>/', views.ScheduleListView.as_view(), name='instructor-schedules'),
]