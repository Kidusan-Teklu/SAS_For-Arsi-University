import pymongo
import hashlib
from datetime import datetime
from bson import ObjectId

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["attendance_system"]

# Drop existing collections to start fresh
collections = db.list_collection_names()
for collection in collections:
    db[collection].drop()

print("Creating collections and adding sample data...")

# Create users collection with all role types
users_collection = db["core_user"]
users = [
    {
        "_id": ObjectId(),
        "name": "Admin User",
        "email": "admin@example.com",
        "password": hash_password("admin123"),
        "role": "super_admin",
        "department": "Administration",
        "created_at": datetime.now()
    },
    {
        "_id": ObjectId(),
        "name": "Student User",
        "email": "student@example.com",
        "password": hash_password("student123"),
        "role": "student",
        "department": "Computer Science",
        "created_at": datetime.now()
    },
    {
        "_id": ObjectId(),
        "name": "Employee User",
        "email": "employee@example.com",
        "password": hash_password("employee123"),
        "role": "employee",
        "department": "IT Department",
        "created_at": datetime.now()
    },
    {
        "_id": ObjectId(),
        "name": "Lecturer User",
        "email": "lecturer@example.com",
        "password": hash_password("lecturer123"),
        "role": "instructor",
        "department": "Computer Science",
        "created_at": datetime.now()
    },
    {
        "_id": ObjectId(),
        "name": "HR Officer",
        "email": "hr@example.com",
        "password": hash_password("hr123"),
        "role": "admin_official",
        "department": "HR",
        "created_at": datetime.now()
    }
]

users_collection.insert_many(users)
print(f"Added {len(users)} users")

# Create students collection
students_collection = db["core_student"]
students = [
    {
        "_id": ObjectId(),
        "user_id": users[1]["_id"],  # Reference to student user
        "enrollment_number": "ETH001",
        "course": "Computer Science",
        "year_of_study": 3
    }
]
students_collection.insert_many(students)
print(f"Added {len(students)} students")

# Create employees collection
employees_collection = db["core_employee"]
employees = [
    {
        "_id": ObjectId(),
        "user_id": users[2]["_id"],  # Reference to employee user
        "employee_id": "EMP001",
        "position": "IT Specialist",
        "department": "IT Department"
    }
]
employees_collection.insert_many(employees)
print(f"Added {len(employees)} employees")

# Create attendance collection
attendance_collection = db["core_attendance"]
attendance_records = [
    {
        "_id": ObjectId(),
        "user_id": users[1]["_id"],  # Student user
        "date": datetime.now(),
        "time_in": datetime.now(),
        "time_out": None,
        "status": "present"
    },
    {
        "_id": ObjectId(),
        "user_id": users[2]["_id"],  # Employee user
        "date": datetime.now(),
        "time_in": datetime.now(),
        "time_out": None,
        "status": "present"
    }
]
attendance_collection.insert_many(attendance_records)
print(f"Added {len(attendance_records)} attendance records")

# Create schedules collection
schedules_collection = db["core_schedule"]
schedules = [
    {
        "_id": ObjectId(),
        "title": "Introduction to Programming",
        "instructor_id": users[3]["_id"],  # Lecturer user
        "start_time": datetime.now(),
        "end_time": datetime.now().replace(hour=datetime.now().hour + 2),
        "location": "Room 101"
    }
]
schedules_collection.insert_many(schedules)
print(f"Added {len(schedules)} schedules")

# Create notifications collection
notifications_collection = db["core_notification"]
notifications = [
    {
        "_id": ObjectId(),
        "recipient_id": users[1]["_id"],  # Student user
        "message": "Welcome to the Attendance System!",
        "sent_at": datetime.now(),
        "is_read": False
    }
]
notifications_collection.insert_many(notifications)
print(f"Added {len(notifications)} notifications")

print("\nDatabase setup complete!")
print("You can now log in with the following credentials:")
print("- Admin: admin@example.com / admin123")
print("- Student: student@example.com / student123")
print("- Employee: employee@example.com / employee123")
print("- Lecturer: lecturer@example.com / lecturer123")
print("- HR Officer: hr@example.com / hr123") 