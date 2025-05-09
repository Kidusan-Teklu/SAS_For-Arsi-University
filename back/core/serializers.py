from rest_framework import serializers
from .models import UserProfile, Attendance, Schedule, Notification, Class
from django.contrib.auth.models import User
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

class ObjectIdField(serializers.Field):
    """Field for MongoDB ObjectId handling."""
    
    def to_representation(self, value):
        return str(value)
    
    def to_internal_value(self, data):
        if not data:
            return None
        try:
            return ObjectId(data)
        except (TypeError, ValueError):
            raise serializers.ValidationError(f"'{data}' is not a valid ObjectId")

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True},
        }

class UserProfileSerializer(serializers.ModelSerializer):
    _id = ObjectIdField(required=False)
    
    class Meta:
        model = UserProfile
        fields = ['_id', 'user', 'role', 'department', 'created_at']

class AttendanceSerializer(serializers.ModelSerializer):
    _id = ObjectIdField(required=False)
    
    class Meta:
        model = Attendance
        fields = ['_id', 'user', 'date', 'time_in', 'time_out', 'status']

class ClassSerializer(serializers.ModelSerializer):
    _id = ObjectIdField(required=False)
    
    class Meta:
        model = Class
        fields = ['_id', 'course_name', 'course_code', 'instructor', 'department', 'student_count', 'created_at']

class ScheduleSerializer(serializers.ModelSerializer):
    _id = ObjectIdField(required=False)
    
    class Meta:
        model = Schedule
        fields = ['_id', 'class_id', 'instructor', 'room', 'day', 'start_time', 'end_time', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    _id = ObjectIdField(required=False)
    
    class Meta:
        model = Notification
        fields = ['_id', 'recipient', 'message', 'sent_at', 'is_read']