from django.urls import path
from .views import GenerateReportView, GetAllReportsView

urlpatterns = [
    path('', GetAllReportsView.as_view(), name='get-all-reports'),
    path('generate/', GenerateReportView.as_view(), name='generate-report'),
]