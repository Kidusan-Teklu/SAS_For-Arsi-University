from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['attendance_system']

# Count test users
user_count = db.users.count_documents({'email': {'$regex': '^test.*@example.com'}})
print(f"Total test users: {user_count}")

# List all users
print("\nUser list:")
for user in db.users.find({'email': {'$regex': '^test.*@example.com'}}):
    print(f"- {user['name']} ({user['email']}) - Role: {user['role']}")

# Count attendance records
attendance_count = db.attendance.count_documents({})
print(f"\nTotal attendance records: {attendance_count}")

# Sample of attendance records
print("\nSample attendance records:")
for record in db.attendance.find().limit(5):
    user = db.users.find_one({'_id': record['user']})
    user_name = user['name'] if user else 'Unknown User'
    print(f"- {user_name} on {record['date']}: {record['status']}") 