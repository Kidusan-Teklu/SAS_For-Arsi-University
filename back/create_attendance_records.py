from pymongo import MongoClient
from datetime import datetime, timedelta
import random
from bson import ObjectId

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['attendance_system']

# Get all test users
test_users = list(db.users.find({'email': {'$regex': '^test.*@example.com'}}))

if not test_users:
    print("No test users found. Please run create_users.py first.")
    exit()

# First clear ALL existing attendance records
print("Clearing all existing attendance records...")
db.attendance.delete_many({})

# Generate attendance records for the past 30 days
today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
statuses = ['present', 'absent', 'late']
status_weights = [0.8, 0.1, 0.1]  # 80% present, 10% absent, 10% late

attendance_records = []

for user in test_users:
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
    print(f"\nCreated {len(attendance_records)} attendance records for {len(test_users)} users.")
else:
    print("No attendance records created.")

print("\nSample attendance data created successfully.")

# Verify data
print("\nVerification:")
for role in ['student', 'employee', 'department_head', 'instructor', 'hr_officer', 'finance_officer', 'administrative_officer', 'admin']:
    user = db.users.find_one({'role': role})
    if user:
        records_count = db.attendance.count_documents({'user': user['_id']})
        print(f"- {user['name']} ({role}): {records_count} attendance records") 