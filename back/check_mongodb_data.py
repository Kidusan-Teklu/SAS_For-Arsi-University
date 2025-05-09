import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SAS_backend.settings')
django.setup()

# Import models
from core.models import User, Student, Employee, Attendance, Schedule, Notification

def check_data():
    """Check if Django can access the MongoDB data"""
    print("Checking MongoDB data through Django ORM...")
    
    # Check users
    users = User.objects.all()
    print(f"\nFound {users.count()} users:")
    for user in users:
        print(f"- {user.name} ({user.email}, {user.role})")
    
    # Check students
    students = Student.objects.all()
    print(f"\nFound {students.count()} students:")
    for student in students:
        print(f"- {student.enrollment_number}: {student.user.name if student.user else 'Unknown'}")
    
    # Check employees
    employees = Employee.objects.all()
    print(f"\nFound {employees.count()} employees:")
    for employee in employees:
        print(f"- {employee.employee_id}: {employee.user.name if employee.user else 'Unknown'} ({employee.position})")
    
    # Check attendance records
    attendance = Attendance.objects.all()
    print(f"\nFound {attendance.count()} attendance records:")
    for record in attendance:
        print(f"- {record.user.name if record.user else 'Unknown'}: {record.date} ({record.status})")
    
    # Check schedules
    schedules = Schedule.objects.all()
    print(f"\nFound {schedules.count()} schedules:")
    for schedule in schedules:
        print(f"- {schedule.title}: {schedule.start_time} to {schedule.end_time}")
    
    # Check notifications
    notifications = Notification.objects.all()
    print(f"\nFound {notifications.count()} notifications:")
    for notification in notifications:
        print(f"- To {notification.recipient.name if notification.recipient else 'Unknown'}: {notification.message[:30]}...")

if __name__ == "__main__":
    check_data() 