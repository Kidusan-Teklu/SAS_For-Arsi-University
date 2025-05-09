from djongo import models
from bson import ObjectId
from datetime import datetime

class UserProfile(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    user = models.CharField(max_length=100)
    role = models.CharField(max_length=20)
    department = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.user

class Attendance(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    user = models.CharField(max_length=100)
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='absent')
    
    class Meta:
        unique_together = ['user', 'date']
    
    def __str__(self):
        return f"{self.user} - {self.date}"

class Class(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    course_name = models.CharField(max_length=100)
    course_code = models.CharField(max_length=20)
    instructor = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    student_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=datetime.now)
    
    def __str__(self):
        return f"{self.course_code} - {self.course_name}"

class Schedule(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    class_id = models.CharField(max_length=100)  # Reference to Class._id
    instructor = models.CharField(max_length=100)
    room = models.CharField(max_length=50, default='Room 101')
    day = models.CharField(max_length=10, default='Monday')  # Monday, Tuesday, etc.
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(default=datetime.now)
    
    def __str__(self):
        return f"{self.class_id} - {self.day} {self.start_time}"

class Notification(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    recipient = models.CharField(max_length=100)
    message = models.TextField()
    sent_at = models.DateTimeField(default=datetime.now)
    is_read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.recipient} - {self.sent_at}"
