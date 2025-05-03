from django.urls import path
from .views import BiometricDataView, BiometricDataListView, BiometricDataDetailView

urlpatterns = [
    path('', BiometricDataView.as_view(), name='biometric-data-create'),  # Endpoint for creating biometric data
    path('data/', BiometricDataListView.as_view(), name='biometric-data-list'),  # Endpoint for listing all biometric data
    path('data/<str:id>/', BiometricDataDetailView.as_view(), name='biometric-data-detail'),  # Endpoint for retrieving, updating, or deleting specific biometric data
]