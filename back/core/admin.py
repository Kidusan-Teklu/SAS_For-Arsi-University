from django.contrib import admin
from .models import UserProfile, Attendance, Schedule, Notification

# Register your models here.
admin.site.register(UserProfile)
admin.site.register(Attendance)
admin.site.register(Schedule)
admin.site.register(Notification)