from rest_framework import serializers
from .models import User, Student, Employee, Attendance, Schedule, Notification
import logging
from bson import ObjectId

logger = logging.getLogger(__name__)

class ObjectIdField(serializers.Field):
    """Field for handling MongoDB ObjectId objects."""
    
    def to_representation(self, value):
        return str(value)
    
    def to_internal_value(self, data):
        try:
            return ObjectId(data)
        except (TypeError, ValueError):
            raise serializers.ValidationError(f"'{data}' is not a valid ObjectId")

class UserSerializer(serializers.ModelSerializer):
    _id = ObjectIdField(required=False)
    
    class Meta:
        model = User
        fields = ['_id', 'name', 'email', 'password', 'role', 'department', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True},
            'created_at': {'read_only': True},
        }

class StudentSerializer(serializers.ModelSerializer):
    _id = ObjectIdField(required=False)
    user = UserSerializer()
    
    class Meta:
        model = Student
        fields = ['_id', 'user', 'enrollment_number', 'course', 'year_of_study']

class EmployeeSerializer(serializers.ModelSerializer):
    _id = ObjectIdField(required=False)
    user = UserSerializer()
    
    class Meta:
        model = Employee
        fields = ['_id', 'user', 'employee_id', 'position', 'department']

class AttendanceSerializer(serializers.ModelSerializer):
    _id = ObjectIdField(required=False, read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['_id', 'user', 'date', 'time_in', 'time_out', 'status']

    def to_internal_value(self, data):
        if isinstance(data.get('user'), dict):
            user_data = data.pop('user')
            try:
                # Use ObjectId directly when looking up the user
                user_id = ObjectId(user_data.get('_id'))
                user = User.objects.get(_id=user_id)
                data['user'] = user._id
            except User.DoesNotExist:
                raise serializers.ValidationError({"user": "User does not exist."})
        elif isinstance(data.get('user'), str):
            try:
                # Convert string ID to ObjectId
                user_id = ObjectId(data['user'])
                user = User.objects.get(_id=user_id)
                data['user'] = user._id
            except User.DoesNotExist:
                raise serializers.ValidationError({"user": "User does not exist."})
        return super().to_internal_value(data)

    def create(self, validated_data):
        attendance = Attendance.objects.create(**validated_data)
        return attendance

class ScheduleSerializer(serializers.ModelSerializer):
    _id = ObjectIdField(required=False, read_only=True)
    instructor = UserSerializer(read_only=True)
    
    class Meta:
        model = Schedule
        fields = ['_id', 'title', 'instructor', 'start_time', 'end_time', 'location']

class NotificationSerializer(serializers.ModelSerializer):
    _id = ObjectIdField(required=False, read_only=True)
    recipient = UserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['_id', 'recipient', 'message', 'sent_at', 'is_read']