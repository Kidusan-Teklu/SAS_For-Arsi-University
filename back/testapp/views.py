from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
import json
import time
from django.core.exceptions import ObjectDoesNotExist

def test_view(request):
    """Simple test view to ensure Django is working correctly"""
    return JsonResponse({
        "status": "success", 
        "message": "Django is working correctly",
        "timestamp": time.time()
    })

def home_view(request):
    """Home view to check if the server is running"""
    return render(request, 'home.html', {
        'title': 'Django Test App',
        'message': 'Welcome to the Django Test App'
    })

@csrf_exempt
def mock_login(request):
    """Mock login endpoint for testing frontend integration"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email', '')
            password = data.get('password', '')
            
            # For testing purposes only - don't use this in production
            if email == 'admin@example.com' and password == 'password123':
                return JsonResponse({
                    "status": "success",
                    "token": "mock_test_token_123456789",
                    "user": {
                        "id": 1,
                        "name": "Admin User",
                        "email": email,
                        "role": "admin"
                    }
                })
            else:
                return JsonResponse({
                    "status": "error",
                    "message": "Invalid credentials"
                }, status=401)
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "Invalid JSON"
            }, status=400)
    else:
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

@csrf_exempt
def mock_attendance(request):
    """Mock attendance endpoint for testing frontend integration"""
    if request.method == 'GET':
        return JsonResponse({
            "status": "success",
            "data": [
                {"date": "2025-05-03", "status": "present", "time_in": "08:30:00", "time_out": "16:30:00"},
                {"date": "2025-05-02", "status": "present", "time_in": "08:25:00", "time_out": "16:45:00"},
                {"date": "2025-05-01", "status": "late", "time_in": "09:15:00", "time_out": "17:00:00"},
                {"date": "2025-04-30", "status": "present", "time_in": "08:30:00", "time_out": "16:30:00"},
                {"date": "2025-04-29", "status": "absent", "time_in": None, "time_out": None}
            ]
        })
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            return JsonResponse({
                "status": "success",
                "message": "Attendance marked successfully",
                "data": data
            })
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "Invalid JSON"
            }, status=400)
    else:
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405) 