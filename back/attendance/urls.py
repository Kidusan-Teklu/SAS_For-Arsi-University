from django.urls import path
from .views import MarkAttendanceView, GetAllAttendanceView, UserAttendanceView

urlpatterns = [
    path('mark/', MarkAttendanceView.as_view(), name='mark-attendance'),  # Retain only the mark/ endpoint
    path('all/', GetAllAttendanceView.as_view(), name='get-all-attendance'),
    path('user/<str:user_id>/', UserAttendanceView.as_view(), name='user-attendance'),
]