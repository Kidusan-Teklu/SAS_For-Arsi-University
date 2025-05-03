# Smart Attendance System (SAS) for Arsi University

The Smart Attendance System (SAS) is a comprehensive web-based solution designed for Arsi University to automate and streamline the attendance tracking process for students and employees.

## Features

- **Student Attendance Tracking**: Using AI-based facial recognition
- **Employee Attendance Management**: Using biometric verification
- **Real-time Notifications**: Instant updates about attendance status
- **Comprehensive Reporting**: Generate detailed attendance reports
- **Schedule Management**: Create and manage class schedules
- **Role-based Access Control**: Different interfaces for students, employees, instructors, and administrators

## Tech Stack

### Backend
- Django (Python web framework)
- MongoDB (via Djongo)
- JWT for authentication

### Frontend
- React.js
- TypeScript/JavaScript
- Material-UI components

## Installation and Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB 4+

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd back
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Start MongoDB:
   ```
   mongod
   ```

5. Run the Django server:
   ```
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd front
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/login/`: User login
- `POST /api/register/`: User registration

### Attendance
- `POST /api/attendance/mark/`: Mark attendance
- `GET /api/attendance/all/`: Get all attendance records
- `GET /api/attendance/user/{user_id}/`: Get attendance records for a specific user

### Notifications
- `POST /api/notifications/`: Send notification
- `GET /api/notifications/`: Get all notifications
- `GET /api/notifications/{notification_id}/`: Get a specific notification
- `PUT /api/notifications/{notification_id}/`: Update a notification
- `DELETE /api/notifications/{notification_id}/`: Delete a notification

### Schedules
- `POST /api/schedules/`: Create schedule
- `GET /api/schedules/`: Get all schedules
- `GET /api/schedules/{schedule_id}/`: Get a specific schedule
- `PUT /api/schedules/{schedule_id}/`: Update a schedule
- `DELETE /api/schedules/{schedule_id}/`: Delete a schedule

### Reports
- `POST /api/reports/generate/`: Generate report
- `GET /api/reports/`: Get all reports

### Biometric
- `POST /api/biometric/`: Add biometric data
- `GET /api/biometric/`: Get all biometric data

### Recognition
- `POST /api/recognition/data/`: Add recognition data
- `GET /api/recognition/`: Get all recognition data

## Contributors
- Kidusan Teklu
- Esayas Etana
- Nardos Tilaye
- Mohammed Umer
- Rediet Dereje 