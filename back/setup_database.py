"""
Setup script for MongoDB database
This script populates the MongoDB database with initial data needed for the SAS application to work.
"""

from pymongo import MongoClient
from datetime import datetime, timedelta
import random
import hashlib
import json
from bson import ObjectId

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['attendance_system']

# First clear all existing data
print("Clearing existing data...")
collections = ['users', 'attendance', 'schedules', 'notifications', 'recognition']
for collection in collections:
    db[collection].delete_many({})
    print(f"- Cleared {collection} collection")

# Create user accounts
print("\nCreating user accounts...")

# Hash password function
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Real users for Arsi University
real_users = [
    {
        'name': 'Admin User',
        'email': 'admin@arsiU.edu.et',
        'password': hash_password('admin123'),
        'role': 'super_admin',
        'department': 'Administration',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Mohammed Umer',
        'email': 'mohammed.umer@arsiU.edu.et',
        'password': hash_password('password123'),
        'role': 'student',
        'department': 'Computer Science',
        'student_id': 'UGR/13285/14',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Rediet Dereje',
        'email': 'rediet.dereje@arsiU.edu.et',
        'password': hash_password('password123'),
        'role': 'student',
        'department': 'Computer Science',
        'student_id': 'UGR/13304/14',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Kidusan Teklu',
        'email': 'kidusan.teklu@arsiU.edu.et',
        'password': hash_password('password123'),
        'role': 'student',
        'department': 'Computer Science',
        'student_id': 'UGR/13262/14',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Esayas Etana',
        'email': 'esayas.etana@arsiU.edu.et',
        'password': hash_password('password123'),
        'role': 'student',
        'department': 'Computer Science',
        'student_id': 'UGR/11870/14',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Nardos Tilaye',
        'email': 'nardos.tilaye@arsiU.edu.et',
        'password': hash_password('password123'),
        'role': 'student',
        'department': 'Computer Science',
        'student_id': 'UGR/13221/14',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Musa A.',
        'email': 'musa.a@arsiU.edu.et',
        'password': hash_password('password123'),
        'role': 'instructor',
        'department': 'Computer Science',
        'employee_id': 'INS001',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Abebe Bekele',
        'email': 'abebe.bekele@arsiU.edu.et',
        'password': hash_password('password123'),
        'role': 'department_head',
        'department': 'Computer Science',
        'employee_id': 'DH001',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Fatima Ali',
        'email': 'fatima.ali@arsiU.edu.et',
        'password': hash_password('password123'),
        'role': 'hr_officer',
        'department': 'Human Resources',
        'employee_id': 'HR001',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Samuel Teshome',
        'email': 'samuel.teshome@arsiU.edu.et',
        'password': hash_password('password123'),
        'role': 'finance_officer',
        'department': 'Finance',
        'employee_id': 'FO001',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Hanna Girma',
        'email': 'hanna.girma@arsiU.edu.et',
        'password': hash_password('password123'),
        'role': 'administrative_officer',
        'department': 'Administration',
        'employee_id': 'AO001',
        'created_at': datetime.utcnow()
    }
]

# Test users (for development convenience)
test_users = [
    {
        'name': 'Test Student',
        'email': 'test.student@example.com',
        'password': hash_password('password123'),
        'role': 'student',
        'department': 'Computer Science',
        'student_id': 'TESTSTD1',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Test Employee',
        'email': 'test.employee@example.com',
        'password': hash_password('password123'),
        'role': 'employee',
        'department': 'Administration',
        'employee_id': 'TESTEMP1',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Test Department Head',
        'email': 'test.department.head@example.com',
        'password': hash_password('password123'),
        'role': 'department_head',
        'department': 'Computer Science',
        'employee_id': 'TESTDH1',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Test Instructor',
        'email': 'test.instructor@example.com',
        'password': hash_password('password123'),
        'role': 'instructor',
        'department': 'Computer Science',
        'employee_id': 'TESTINS1',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Test HR Officer',
        'email': 'test.hr.officer@example.com',
        'password': hash_password('password123'),
        'role': 'hr_officer',
        'department': 'Human Resources',
        'employee_id': 'TESTHR1',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Test Finance Officer',
        'email': 'test.finance.officer@example.com',
        'password': hash_password('password123'),
        'role': 'finance_officer',
        'department': 'Finance',
        'employee_id': 'TESTFO1',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Test Admin Officer',
        'email': 'test.administrative.officer@example.com',
        'password': hash_password('password123'),
        'role': 'administrative_officer',
        'department': 'Administration',
        'employee_id': 'TESTAO1',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Test Admin',
        'email': 'test.admin@example.com',
        'password': hash_password('password123'),
        'role': 'admin',
        'department': 'IT',
        'employee_id': 'TESTADM1',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Test User',
        'email': 'test@example.com',
        'password': hash_password('password123'),
        'role': 'user',
        'department': 'General',
        'employee_id': 'TESTUSER1',
        'created_at': datetime.utcnow()
    }
]

# Insert all users
all_users = real_users + test_users
user_ids = {}  # Keep track of user IDs for reference in other collections

for user in all_users:
    result = db.users.insert_one(user)
    user_ids[user['email']] = result.inserted_id
    print(f"Created {user['role']} user: {user['email']} with ID: {result.inserted_id}")

# Generate attendance records
print("\nGenerating attendance records...")

# Get all users
all_db_users = list(db.users.find({}))

# Generate attendance records for the past 30 days
today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
statuses = ['present', 'absent', 'late']
status_weights = [0.8, 0.1, 0.1]  # 80% present, 10% absent, 10% late

attendance_records = []

for user in all_db_users:
    print(f"Generating attendance records for {user['name']} ({user['email']})...")
    
    # For each day in the past 30 days (excluding weekends)
    for day_offset in range(30):
        date = today - timedelta(days=day_offset)
        
        # Skip weekends (Saturday = 5, Sunday = 6)
        if date.weekday() >= 5:
            continue
            
        # Randomly choose a status based on weights
        status = random.choices(statuses, weights=status_weights, k=1)[0]
        
        # Generate time data based on status
        if status == 'present':
            # Normal working hours (9 AM to 5 PM)
            time_in = f"{random.randint(8, 9)}:{random.randint(0, 59):02d}:00"
            time_out = f"{random.randint(16, 18)}:{random.randint(0, 59):02d}:00"
        elif status == 'late':
            # Late arrival (after 9:30 AM)
            time_in = f"{random.randint(9, 10)}:{random.randint(30, 59):02d}:00"
            time_out = f"{random.randint(16, 18)}:{random.randint(0, 59):02d}:00"
        else:  # absent
            time_in = None
            time_out = None
        
        # Create attendance record
        record = {
            'user': user['_id'],
            'date': date.strftime('%Y-%m-%d'),  # Format as YYYY-MM-DD
            'time_in': time_in,
            'time_out': time_out,
            'status': status,
            'created_at': datetime.utcnow()
        }
        
        attendance_records.append(record)

# Insert all attendance records
if attendance_records:
    db.attendance.insert_many(attendance_records)
    print(f"\nCreated {len(attendance_records)} attendance records for {len(all_db_users)} users.")
else:
    print("No attendance records created.")

# Create class schedules
print("\nCreating class schedules...")

# Get instructor and department head IDs
instructors = list(db.users.find({'role': 'instructor'}))
dept_heads = list(db.users.find({'role': 'department_head'}))

if instructors and dept_heads:
    # Course names for Computer Science
    courses = [
        "Introduction to Programming",
        "Data Structures and Algorithms",
        "Database Systems",
        "Web Development",
        "Computer Networks",
        "Operating Systems",
        "Software Engineering",
        "Artificial Intelligence",
        "Machine Learning",
        "Computer Graphics"
    ]
    
    # Locations (rooms)
    locations = ["Room 101", "Room 102", "Room 103", "Lab 1", "Lab 2", "Lecture Hall A", "Lecture Hall B"]
    
    # Days of the week (Monday to Friday)
    days = [0, 1, 2, 3, 4]  # Monday=0, Friday=4
    
    schedules = []
    
    # Generate schedules for the next 2 weeks
    for instructor in instructors:
        # Assign 3-5 courses to each instructor
        num_courses = random.randint(3, 5)
        instructor_courses = random.sample(courses, num_courses)
        
        for course in instructor_courses:
            # Assign 2-3 sessions per week for each course
            num_sessions = random.randint(2, 3)
            course_days = random.sample(days, num_sessions)
            
            for day in course_days:
                # Start time between 8:00 and 15:00
                start_hour = random.randint(8, 15)
                start_minute = random.choice([0, 30])
                
                # Each session lasts 1-3 hours
                duration_hours = random.randint(1, 3)
                
                # Calculate start and end times for next 2 weeks
                for week in range(2):
                    # Calculate date (today + days until target weekday + weeks)
                    today_weekday = datetime.now().weekday()
                    days_ahead = day - today_weekday
                    if days_ahead < 0:
                        days_ahead += 7
                    
                    target_date = datetime.now() + timedelta(days=days_ahead + (7 * week))
                    
                    # Set the time
                    start_time = target_date.replace(
                        hour=start_hour, 
                        minute=start_minute, 
                        second=0, 
                        microsecond=0
                    )
                    end_time = start_time + timedelta(hours=duration_hours)
                    
                    # Create schedule
                    schedule = {
                        'title': course,
                        'instructor': instructor['_id'],
                        'start_time': start_time,
                        'end_time': end_time,
                        'location': random.choice(locations),
                        'created_at': datetime.utcnow()
                    }
                    
                    schedules.append(schedule)
    
    # Insert schedules
    if schedules:
        db.schedules.insert_many(schedules)
        print(f"Created {len(schedules)} class schedules.")
else:
    print("No instructors or department heads found. Skipping schedule creation.")

# Create notifications
print("\nCreating notifications...")

# Notification templates
notification_templates = [
    "Your attendance record for {date} has been updated to {status}.",
    "Reminder: You have a {course} class tomorrow at {time}.",
    "Your attendance rate for this month is {rate}%.",
    "Meeting scheduled with department head on {date} at {time}.",
    "Please submit your excuse for absence on {date}.",
    "Your leave request has been {status}.",
    "New schedule posted for {course}.",
    "Your profile information has been updated.",
    "System maintenance scheduled for {date}.",
    "Welcome to the new semester! Classes begin on {date}."
]

notifications = []

# Generate random notifications for each user
for user in all_db_users:
    # Number of notifications (1-5 per user)
    num_notifications = random.randint(1, 5)
    
    for _ in range(num_notifications):
        template = random.choice(notification_templates)
        
        # Fill in template placeholders
        message = template.format(
            date=datetime.now().strftime('%Y-%m-%d'),
            status=random.choice(['present', 'absent', 'late', 'approved', 'denied']),
            course=random.choice(['Programming', 'Database', 'Networks', 'AI', 'Web Dev']),
            time=f"{random.randint(8, 17)}:{random.choice(['00', '30'])}",
            rate=random.randint(70, 100)
        )
        
        # Create notification
        notification = {
            'recipient': user['_id'],
            'message': message,
            'sent_at': datetime.now() - timedelta(days=random.randint(0, 14)),
            'is_read': random.choice([True, False]),
            'created_at': datetime.utcnow()
        }
        
        notifications.append(notification)

# Insert notifications
if notifications:
    db.notifications.insert_many(notifications)
    print(f"Created {len(notifications)} notifications.")

print("\nDatabase setup completed successfully!")
print("\nYou can now run the Django development server with:")
print("python manage.py runserver")
print("\nFor test users, login with any of these emails and password: 'password123'")
for user in test_users:
    print(f"- {user['email']} ({user['role']})")
print("\nFor real users, also use password: 'password123'")
print("Admin user: admin@arsiU.edu.et") 