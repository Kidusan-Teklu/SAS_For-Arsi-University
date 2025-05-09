# MongoDB Backend Setup Guide

This guide explains how to set up and run the MongoDB backend for the Arsi University Attendance System.

## Prerequisites

1. MongoDB installed and running on your system
2. Python 3.6 or higher
3. Required Python packages (see requirements.txt)

## Setup Instructions

### 1. Install MongoDB

Make sure MongoDB is installed and running on your system. You can download it from [MongoDB's official website](https://www.mongodb.com/try/download/community).

### 2. Install Required Packages

```bash
pip install -r requirements.txt
```

### 3. Initialize the MongoDB Database

Run the setup script to create collections and add sample data:

```bash
python setup_mongodb.py
```

This script creates the following:
- Sample users with different roles (Admin, Student, Employee, Lecturer, HR)
- Student and employee profiles
- Sample attendance records
- Sample schedules and notifications

### 4. Mark Migrations as Applied

Run the migration fix script to mark all Django migrations as applied without actually running them:

```bash
python migration_fix.py
```

### 5. Run the Server

Start the Django development server:

```bash
python manage.py runserver
```

## Accessing the System

### Admin Panel

1. Go to http://127.0.0.1:8000/admin/
2. Login with one of the following credentials:
   - Admin: admin@example.com / admin123
   - HR: hr@example.com / hr123

### API Endpoints

The API is available at http://127.0.0.1:8000/api/

## Data Structure

The system uses the following MongoDB collections:

1. **core_user**: Stores all user accounts
2. **core_student**: Stores student information
3. **core_employee**: Stores employee information
4. **core_attendance**: Stores attendance records
5. **core_schedule**: Stores class schedules
6. **core_notification**: Stores user notifications

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues, make sure MongoDB is running:

```bash
# For Windows
net start MongoDB

# For macOS/Linux
sudo systemctl start mongod
```

### Django Admin Login Issues

If you can't log in to the Django admin panel, try running:

```bash
python check_mongodb_data.py
```

This will verify that Django can access the MongoDB data.

## Customizing MongoDB Connection

You can customize the MongoDB connection in `SAS_backend/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'attendance_system',
        'ENFORCE_SCHEMA': False,
        'CLIENT': {
            'host': 'localhost',  # Change this for remote MongoDB
            'port': 27017,        # Change this for custom port
            'username': '',       # Add username if authentication is enabled
            'password': '',       # Add password if authentication is enabled
        }
    }
}
``` 