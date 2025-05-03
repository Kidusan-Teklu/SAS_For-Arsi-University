from django.urls import path
from .views import RecognitionDataView, RecognitionDataListView, FaceVerificationView

urlpatterns = [
    path('data/', RecognitionDataView.as_view(), name='recognition-data-create'),  # Endpoint for adding recognition data
    path('', RecognitionDataListView.as_view(), name='recognition-data-list'),  # Endpoint for listing all recognition data
    path('verify/', FaceVerificationView.as_view(), name='face-verification'),  # Endpoint for face verification
]