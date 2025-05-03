from django.urls import path
from .views import ScheduleView, ScheduleDetailView

urlpatterns = [
    path('', ScheduleView.as_view(), name='schedules'),
    path('<str:schedule_id>/', ScheduleDetailView.as_view(), name='schedule-detail'),
]