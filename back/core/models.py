from djongo import models
from django.utils.timezone import now
from bson import ObjectId

class CoreUser(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=50)
    department = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=50, choices=[
        ("student", "Student"),
        ("employee", "Employee"),
        ("instructor", "Instructor"),
        ("dept_head", "Department Head"),
        ("finance", "Finance"),
        ("hr", "HR"),
        ("admin_official", "Admin Official"),
        ("super_admin", "Super Admin"),
    ])
    department = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role})"

class Student(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="student_profile")
    enrollment_number = models.CharField(max_length=50, unique=True)
    course = models.CharField(max_length=255)
    year_of_study = models.IntegerField()

    def __str__(self):
        return f"{self.user.name} - {self.enrollment_number}"

class Employee(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="employee_profile")
    employee_id = models.CharField(max_length=50, unique=True)
    position = models.CharField(max_length=255)
    department = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.user.name} - {self.employee_id}"

class Attendance(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[
        ("present", "Present"),
        ("absent", "Absent"),
        ("late", "Late"),
        ("excused", "Excused"),
    ])

    def __str__(self):
        return f"{self.user.name} - {self.date} ({self.status})"

class Schedule(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    title = models.CharField(max_length=255)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="schedules")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.title} - {self.instructor.name}"

class Notification(models.Model):
    _id = models.ObjectIdField(primary_key=True, default=ObjectId)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    sent_at = models.DateTimeField(default=now)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification to {self.recipient.name} at {self.sent_at}"
