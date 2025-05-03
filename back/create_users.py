from pymongo import MongoClient
from datetime import datetime

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['attendance_system']

# First clear any existing test users
db.users.delete_many({'email': {'$regex': '^test.*@example.com'}})

# List of users to create
users = [
    {
        'name': 'Student User',
        'email': 'test.student@example.com',
        'password': 'password123',
        'role': 'student',
        'department': 'Computer Science',
        'student_id': 'CS2023001',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Employee User',
        'email': 'test.employee@example.com',
        'password': 'password123',
        'role': 'employee',
        'department': 'HR',
        'employee_id': 'EMP2023001',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Department Head',
        'email': 'test.department.head@example.com',
        'password': 'password123',
        'role': 'department_head',
        'department': 'Computer Science',
        'employee_id': 'DH2023001',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Instructor User',
        'email': 'test.instructor@example.com',
        'password': 'password123',
        'role': 'instructor',
        'department': 'Computer Science',
        'employee_id': 'INS2023001',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'HR Officer',
        'email': 'test.hr.officer@example.com',
        'password': 'password123',
        'role': 'hr_officer',
        'department': 'Human Resources',
        'employee_id': 'HR2023001',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Finance Officer',
        'email': 'test.finance.officer@example.com',
        'password': 'password123',
        'role': 'finance_officer',
        'department': 'Finance',
        'employee_id': 'FO2023001',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'Administrative Officer',
        'email': 'test.administrative.officer@example.com',
        'password': 'password123',
        'role': 'administrative_officer',
        'department': 'Administration',
        'employee_id': 'AO2023001',
        'created_at': datetime.utcnow()
    },
    {
        'name': 'General Admin',
        'email': 'test.admin@example.com',
        'password': 'password123',
        'role': 'admin',
        'department': 'IT',
        'employee_id': 'ADM2023001',
        'created_at': datetime.utcnow()
    }
]

# Insert users
for user in users:
    result = db.users.insert_one(user)
    print(f"Created {user['role']} user: {user['email']} with ID: {result.inserted_id}")

print()  # Add a blank line
print("User credentials created successfully.")
print("You can log in with any of these emails and password: 'password123'") 