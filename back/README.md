# Smart Attendance System Backend

This is the backend server for the Smart Attendance System (SAS) project.

## Setup

### Prerequisites

- Python 3.10+
- MongoDB (local installation or MongoDB Atlas)
- pip (Python package manager)

### Installation

1. Clone the repository
2. Create a virtual environment:

```bash
cd back
python -m venv venv
```

3. Activate the virtual environment:

- Windows:
```bash
venv\Scripts\activate
```

- macOS/Linux:
```bash
source venv/bin/activate
```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Configure MongoDB:

Make sure MongoDB is running. The default configuration in `settings.py` assumes MongoDB is running on localhost:27017 with database name `sas_db`.

6. Start the server:

```bash
python manage.py runserver
```

The server will be available at http://localhost:8000

## API Endpoints

### Authentication

- `POST /api/login/` - Login user
- `POST /api/register/` - Register new user

### Attendance

- `POST /api/attendance/mark/` - Mark attendance
- `GET /api/attendance/all/` - Get all attendance records
- `GET /api/attendance/user/{user_id}/` - Get attendance records for a specific user

### Users

- `GET /api/users/` - Get all users
- `POST /api/users/create/` - Create a new user

### Health Check

- `GET /api/health/` - Check if the API is healthy

## Development

This project uses the following technologies:

- Django 3.1.12
- Django REST Framework
- Djongo (MongoDB connector for Django)
- JWT Authentication 