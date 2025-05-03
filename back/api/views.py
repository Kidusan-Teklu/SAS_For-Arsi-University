from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
import jwt
from datetime import datetime, timedelta, date
from django.conf import settings
import json

# Custom JSON encoder for MongoDB ObjectId and datetime
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)

logger = logging.getLogger(__name__)

# Initialize MongoDB client
client = MongoClient('mongodb://localhost:27017/')
db = client['attendance_system']

# Create your views here.

class UserListView(APIView):
    def get(self, request):
        users = list(db['users'].find({}, {'_id': 1, 'name': 1, 'email': 1, 'role': 1, 'department': 1, 'created_at': 1}))
        for user in users:
            user['_id'] = str(user['_id'])  # Convert ObjectId to string
        return Response(users, status=status.HTTP_200_OK)

class UserCreateView(APIView):
    def post(self, request):
        try:
            user_data = request.data
            if '_id' in user_data:
                user_data['_id'] = ObjectId(user_data['_id'])  # Convert _id to ObjectId
            db['users'].insert_one(user_data)
            user_data['_id'] = str(user_data['_id'])  # Convert ObjectId back to string for response
            return Response(user_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class HealthCheckView(APIView):
    def get(self, request):
        try:
            client.list_database_names()  # Verify MongoDB connection
            return Response({"message": "MongoDB connection is healthy."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": "MongoDB connection failed.", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Special case for test user
            if email == 'test@example.com' and password == 'password123':
                # Create a test user response
                test_user = {
                    "_id": "test123456789",
                    "name": "Test User",
                    "email": "test@example.com",
                    "role": "user"
                }
                
                # Generate JWT token
                payload = {
                    'id': test_user["_id"],
                    'role': test_user["role"],
                    'iat': datetime.utcnow(),
                    'exp': datetime.utcnow() + timedelta(hours=1)
                }
                
                token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
                
                return Response({
                    "token": token,
                    "user": test_user
                }, status=status.HTTP_200_OK)
            
            # Regular login flow
            user = db['users'].find_one({"email": email})
            
            if not user:
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if password field exists and is in correct format
            stored_password = user.get('password', '')
            
            # For demo purposes assuming password is stored in plain text or basic hashing
            # In production, use proper hashing like bcrypt
            if stored_password != password:  # Simple comparison for demo
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generate JWT token
            payload = {
                'id': str(user['_id']),
                'role': user.get('role', 'user'),
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=1)
            }
            
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
            
            return Response({
                "token": token,
                "user": {
                    "id": str(user['_id']),
                    "name": user.get('name', ''),
                    "email": user.get('email', ''),
                    "role": user.get('role', 'user'),
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RegisterView(APIView):
    def post(self, request):
        data = request.data
        required_fields = ['name', 'email', 'password', 'role']
        
        # Check if all required fields are present
        for field in required_fields:
            if field not in data:
                return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Check if email already exists
            if db['users'].find_one({"email": data['email']}):
                return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new user
            new_user = {
                "name": data['name'],
                "email": data['email'],
                "password": data['password'],  # In production, hash this password
                "role": data['role'],
                "department": data.get('department', ''),
                "created_at": datetime.utcnow()
            }
            
            result = db['users'].insert_one(new_user)
            new_user['_id'] = str(result.inserted_id)
            
            # Generate JWT token
            payload = {
                'id': new_user['_id'],
                'role': new_user['role'],
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=1)
            }
            
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
            
            # Remove password from response
            del new_user['password']
            
            return Response({
                "message": "User registered successfully",
                "token": token,
                "user": new_user
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
