# MongoDB Authentication Fix

## Problem

The original issue occurred when trying to log into the Django admin panel using MongoDB user credentials:

```
TypeError at /admin/login/
Field 'id' expected a number but got ObjectId('68174017916a1b278c424e3d').
```

This error happened because Django was trying to create a standard Django user model with a MongoDB ObjectId, which isn't compatible with Django's internal user ID field (which expects an integer).

## Solution

We implemented a custom authentication system that bridges Django and MongoDB:

1. **In-Memory User Model**: Created a special `InMemoryUser` class that mimics Django's User model without database operations
2. **Custom Authentication Backend**: Implemented the `MongoDBBackend` that authenticates against MongoDB but returns in-memory user objects
3. **Session-Based State**: Store MongoDB user information in the session for persistence between requests
4. **Middleware Integration**: Added middleware to ensure MongoDB user data is available throughout the request cycle
5. **Custom Login Flow**: Implemented a custom login view that redirects users based on their MongoDB role

## Implementation Details

### 1. Custom Authentication Backend (`core/auth.py`)

The `MongoDBBackend` class:
- Authenticates users against MongoDB using email/password
- Creates in-memory user objects instead of database models
- Maps MongoDB roles to Django permissions (`is_staff`, `is_superuser`)

### 2. Custom User Class (`core/auth.py`)

The `InMemoryUser` class:
- Implements Django's expected user interface (`is_authenticated`, `has_perm`, etc.)
- Uses MongoDB user ID as its primary key
- Sets permissions based on MongoDB user role

### 3. Middleware (`core/middleware.py`)

The `MongoDBAuthMiddleware`:
- Attaches MongoDB user data to each request
- Handles both in-memory users and standard Django users
- Maintains user state between requests

### 4. Context Processor (`core/context_processors.py`)

Makes MongoDB user data available in templates:
- Adds `mongodb_user` to the template context
- Provides role and name for easy template access

### 5. Custom Views (`core/views.py`)

User-friendly login and dashboard:
- Custom login view that works with MongoDB auth
- Role-based redirects after login
- Dashboard tailored to user role

## How It Works

1. User submits login credentials on the custom login form
2. `MongoDBBackend` authenticates against MongoDB
3. If successful, an `InMemoryUser` object is created and stored in the session
4. User is redirected based on their role (admin panel or dashboard)
5. The middleware ensures MongoDB user data is available throughout the application

## Benefits

1. **Security**: No need to duplicate user data in SQLite
2. **Consistency**: All user data remains in MongoDB as specified in the documentation
3. **Flexibility**: Custom dashboard for different user roles
4. **Better UX**: Login form with proper error handling

## Usage

- **Admin Users**: Can log in at `/login/` or `/admin/login/` with admin@example.com / admin123
- **Student Users**: Can log in at `/login/` with student@example.com / student123
- **Other Users**: Employee, lecturer, and HR users each have their own dashboards 