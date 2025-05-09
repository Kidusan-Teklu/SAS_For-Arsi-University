from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.mongodb_login, name='mongodb_login'),
    path('logout/', views.mongodb_logout, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('users/', views.manage_users, name='manage_users'),
    path('users/add/', views.add_user, name='add_user'),
    path('users/delete/<str:user_id>/', views.delete_user, name='delete_user'),
    path('profile/image/', views.student_image_upload, name='student_image_upload'),
    path('profile/image/save/', views.save_student_image, name='save_student_image'),
] 