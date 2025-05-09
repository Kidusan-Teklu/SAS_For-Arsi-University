from django.urls import path
from django.contrib import admin
from .views import test_view, home_view, mock_login, mock_attendance

urlpatterns = [
    path('', home_view, name='home'),
    path('test/', test_view, name='test-view'),
    path('admin/', admin.site.urls),
    path('api/login/', mock_login, name='mock-login'),
    path('api/attendance/', mock_attendance, name='mock-attendance'),
] 