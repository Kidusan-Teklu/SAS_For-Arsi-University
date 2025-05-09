from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import logging
import bcrypt
import jwt
from datetime import datetime, timedelta, date
from django.conf import settings
import json
from django.contrib.auth.models import User
from django.db.models import Q
from core.models import UserProfile, Attendance, Schedule, Notification, Class
from bson import ObjectId
from pymongo import MongoClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.serializers import ClassSerializer, ScheduleSerializer

# Initialize MongoDB client
client = MongoClient('localhost', 27017)
db = client['attendance_system']

# Custom JSON encoder for datetime and ObjectId
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)

logger = logging.getLogger(__name__)

# Create your views here.

class UserListView(APIView):
    def get(self, request):
        try:
            # Get all users from Django auth system
            django_users = User.objects.all().values('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')
            users_dict = {user['username']: user for user in django_users}
            
            # Get user profiles from MongoDB
            profiles = list(UserProfile.objects.all())
            
            # Combine data
            result = []
            for profile in profiles:
                user_data = users_dict.get(profile.user, {})
                result.append({
                    '_id': str(profile._id),
                    'django_id': user_data.get('id'),
                    'username': profile.user,
                    'email': user_data.get('email'),
                    'name': f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
                    'role': profile.role,
                    'department': profile.department,
                    'created_at': profile.created_at
                })
                
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching users: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserCreateView(APIView):
    def post(self, request):
        try:
            user_data = request.data
            
            # Create Django user
            user = User.objects.create_user(
                username=user_data.get('email'),
                email=user_data.get('email'),
                password=user_data.get('password'),
                first_name=user_data.get('name', '').split(' ')[0],
                last_name=' '.join(user_data.get('name', '').split(' ')[1:]) if len(user_data.get('name', '').split(' ')) > 1 else ''
            )
            
            # Create user profile in MongoDB
            profile = UserProfile.objects.create(
                user=user.username,
                role=user_data.get('role', 'user'),
                department=user_data.get('department')
            )
            
            # Prepare response
            response_data = {
                '_id': str(profile._id),
                'django_id': user.id,
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'role': profile.role,
                'department': profile.department
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class HealthCheckView(APIView):
    def get(self, request):
        try:
            # Check MongoDB connection
            client.admin.command('ping')
            # Check Django connection
            User.objects.first()
            return Response({"message": "Database connections are healthy."}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return Response({"message": "Database connection failed.", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        logger.info(f"Login attempt for email: {email}")
        
        if not email or not password:
            logger.warning("Login attempt with missing credentials")
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Try to find the user by email
            try:
                user = User.objects.get(email=email)
                logger.info(f"User found: {user.username}")
            except User.DoesNotExist:
                logger.warning(f"Login attempt with non-existent email: {email}")
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check password
            if not user.check_password(password):
                logger.warning(f"Invalid password for user: {user.username}")
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Get user profile for role information
            try:
                profile = UserProfile.objects.get(user=user.username)
                profile_id = str(profile._id) if profile._id else None
                role = profile.role
                department = profile.department
                logger.info(f"User profile found - Role: {role}, Department: {department}")
            except UserProfile.DoesNotExist:
                logger.warning(f"No profile found for user: {user.username}")
                profile_id = None
                role = 'user'  # Default role if profile not found
                department = None
            
            # Generate token using SimpleJWT
            refresh = RefreshToken.for_user(user)
            
            # Add custom claims to the token
            refresh['profile_id'] = profile_id
            refresh['role'] = role
            refresh['email'] = user.email
            refresh['name'] = f"{user.first_name} {user.last_name}".strip()
            
            # Log token generation
            logger.info(f"Generated refresh token for user: {user.username}")
            
            response_data = {
                "refresh": str(refresh),
                "token": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "profile_id": profile_id,
                    "name": f"{user.first_name} {user.last_name}".strip(),
                    "email": user.email,
                    "role": role,
                    "department": department
                }
            }
            
            logger.info(f"Login successful for user: {user.username}")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
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
            if User.objects.filter(email=data['email']).exists():
                return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create new user
            name_parts = data['name'].split(' ')
            first_name = name_parts[0]
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            user = User.objects.create_user(
                username=data['email'],
                email=data['email'],
                password=data['password'],
                first_name=first_name,
                last_name=last_name
            )
            
            # Create user profile
            profile = UserProfile.objects.create(
                user=user.username,
                role=data.get('role', 'user'),
                department=data.get('department')
            )
            
            # Get profile ID
            profile_id = str(profile._id) if profile._id else None
            
            # Generate token using SimpleJWT (same as LoginView)
            refresh = RefreshToken.for_user(user)
            
            # Add custom claims to the token
            refresh['profile_id'] = profile_id
            refresh['role'] = profile.role
            refresh['email'] = user.email
            refresh['name'] = f"{first_name} {last_name}".strip()
            
            # Log for debugging
            logger.debug(f"Generated refresh token for new user: {user.id}")
            
            return Response({
                "message": "User registered successfully",
                "refresh": str(refresh),
                "token": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "profile_id": profile_id,
                    "name": data['name'],
                    "email": user.email,
                    "role": profile.role,
                    "department": profile.department
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AttendanceAPI(APIView):
    def post(self, request):
        """Record a new attendance entry"""
        try:
            data = request.data
            user_id = data.get('user_id')
            date_str = data.get('date', datetime.now().strftime('%Y-%m-%d'))
            
            if not user_id:
                return Response({"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user exists
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Parse date
            try:
                attendance_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if an attendance record already exists for this user and date
            existing_record = Attendance.objects.filter(
                user=user.username,
                date=attendance_date
            ).first()
            
            current_time = datetime.now().time()
            
            if existing_record:
                # Update existing record with time out
                existing_record.time_out = current_time
                existing_record.status = 'completed'
                existing_record.save()
                
                return Response({
                    "message": "Time out recorded successfully",
                    "attendance": {
                        "_id": str(existing_record._id),
                        "user": existing_record.user,
                        "date": existing_record.date,
                        "time_in": existing_record.time_in,
                        "time_out": existing_record.time_out,
                        "status": existing_record.status
                    }
                }, status=status.HTTP_200_OK)
            else:
                # Create new attendance record with time in
                new_attendance = Attendance.objects.create(
                    user=user.username,
                    date=attendance_date,
                    time_in=current_time,
                    status='in_progress'
                )
                
                return Response({
                    "message": "Time in recorded successfully",
                    "attendance": {
                        "_id": str(new_attendance._id),
                        "user": new_attendance.user,
                        "date": new_attendance.date,
                        "time_in": new_attendance.time_in,
                        "time_out": new_attendance.time_out,
                        "status": new_attendance.status
                    }
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Attendance recording error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Get attendance records with optional filtering"""
        try:
            user_id = request.query_params.get('user_id')
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            
            # Build query
            query = {}
            
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    query['user'] = user.username
                except User.DoesNotExist:
                    return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            if date_from or date_to:
                if date_from:
                    try:
                        from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                        query['date__gte'] = from_date
                    except ValueError:
                        return Response({"error": "Invalid date_from format. Use YYYY-MM-DD"}, 
                                      status=status.HTTP_400_BAD_REQUEST)
                
                if date_to:
                    try:
                        to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                        query['date__lte'] = to_date
                    except ValueError:
                        return Response({"error": "Invalid date_to format. Use YYYY-MM-DD"}, 
                                      status=status.HTTP_400_BAD_REQUEST)
            
            # Retrieve attendance records
            attendance_records = Attendance.objects.filter(**query).order_by('-date')
            
            # Prepare response
            result = []
            for record in attendance_records:
                try:
                    user = User.objects.get(username=record.user)
                    try:
                        profile = UserProfile.objects.get(user=user.username)
                        department = profile.department
                    except UserProfile.DoesNotExist:
                        department = None
                        
                    result.append({
                        "_id": str(record._id),
                        "user_id": user.id,
                        "user": {
                            "name": f"{user.first_name} {user.last_name}".strip(),
                            "email": user.email,
                            "department": department
                        },
                        "date": record.date,
                        "time_in": record.time_in,
                        "time_out": record.time_out,
                        "status": record.status
                    })
                except User.DoesNotExist:
                    # Include record even if user is missing
                    result.append({
                        "_id": str(record._id),
                        "user": record.user,
                        "date": record.date,
                        "time_in": record.time_in,
                        "time_out": record.time_out,
                        "status": record.status
                    })
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Attendance retrieval error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserProfileView(APIView):
    def get(self, request):
        """Get the profile of the currently authenticated user"""
        try:
            # Get user ID from request (set by middleware)
            user_id = request.user_id
            
            if not user_id:
                return Response({"error": "User ID not found in request"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the Django user
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Get user profile from MongoDB
            try:
                profile = UserProfile.objects.get(user=user.username)
            except UserProfile.DoesNotExist:
                return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Get recent attendance records
            attendance_records = list(Attendance.objects.filter(user=user.username).order_by('-date')[:5])
            
            # Get notifications
            notifications = list(Notification.objects.filter(recipient=user.username).order_by('-sent_at')[:5])
            
            # Format response
            profile_data = {
                "id": user.id,
                "profile_id": str(profile._id),
                "username": user.username,
                "email": user.email,
                "name": f"{user.first_name} {user.last_name}".strip(),
                "role": profile.role,
                "department": profile.department,
                "created_at": profile.created_at,
                "recent_attendance": [
                    {
                        "date": record.date,
                        "time_in": record.time_in,
                        "time_out": record.time_out,
                        "status": record.status
                    } for record in attendance_records
                ],
                "notifications": [
                    {
                        "id": str(notification._id),
                        "message": notification.message,
                        "sent_at": notification.sent_at,
                        "is_read": notification.is_read
                    } for notification in notifications
                ]
            }
            
            return Response(profile_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching user profile: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AttendanceListView(APIView):
    def get(self, request):
        """Get all attendance records, with optional filtering by user, date, etc."""
        try:
            # Get query parameters
            user_id = request.query_params.get('user_id')
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            department = request.query_params.get('department')
            
            logger.info(f"Fetching attendance records with params: user_id={user_id}, department={department}")
            
            # Build query
            query = {}
            
            # Filter by user if specified
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    query['user'] = user.username
                    logger.info(f"Filtering by user: {user.username}")
                except User.DoesNotExist:
                    logger.error(f"User not found with ID: {user_id}")
                    return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Filter by date range if specified
            if date_from or date_to:
                if date_from:
                    try:
                        from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                        query['date__gte'] = from_date
                        logger.info(f"Filtering by date from: {from_date}")
                    except ValueError:
                        logger.error(f"Invalid date_from format: {date_from}")
                        return Response({"error": "Invalid date_from format. Use YYYY-MM-DD"}, 
                                      status=status.HTTP_400_BAD_REQUEST)
                
                if date_to:
                    try:
                        to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                        query['date__lte'] = to_date
                        logger.info(f"Filtering by date to: {to_date}")
                    except ValueError:
                        logger.error(f"Invalid date_to format: {date_to}")
                        return Response({"error": "Invalid date_to format. Use YYYY-MM-DD"}, 
                                      status=status.HTTP_400_BAD_REQUEST)
            
            # Get all users for user information
            users = {user.username: user for user in User.objects.all()}
            logger.info(f"Total users found: {len(users)}")
            
            # Get all profiles for department information
            profiles = {profile.user: profile for profile in UserProfile.objects.all()}
            logger.info(f"Total profiles found: {len(profiles)}")
            
            # If user is an instructor, only show attendance records for students in their department
            if request.user_role == 'instructor':
                try:
                    instructor_profile = UserProfile.objects.get(user=request.user.username)
                    instructor_department = instructor_profile.department
                    logger.info(f"Instructor department: {instructor_department}")
                    
                    # Get all students in the instructor's department
                    students_in_dept = [profile.user for profile in profiles.values() 
                                      if profile.department == instructor_department and 
                                      profile.role == 'student']
                    
                    logger.info(f"Students in department: {len(students_in_dept)}")
                    
                    if students_in_dept:
                        query['user__in'] = students_in_dept
                    else:
                        logger.warning("No students found in instructor's department")
                        return Response([], status=status.HTTP_200_OK)
                except UserProfile.DoesNotExist:
                    logger.error(f"Instructor profile not found for user: {request.user.username}")
                    return Response({"error": "Instructor profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # If department filter is applied, get only attendance records for students in that department
            elif department:
                students_in_dept = [profile.user for profile in profiles.values() 
                                  if profile.department == department and 
                                  profile.role == 'student']
                logger.info(f"Students in department {department}: {len(students_in_dept)}")
                
                if students_in_dept:
                    query['user__in'] = students_in_dept
                else:
                    logger.warning(f"No students found in department: {department}")
                    return Response([], status=status.HTTP_200_OK)
            
            # Get attendance records
            attendance_records = list(Attendance.objects.filter(**query).order_by('-date'))
            logger.info(f"Total attendance records found: {len(attendance_records)}")
            
            # Prepare response
            result = []
            for record in attendance_records:
                user_obj = users.get(record.user)
                profile = profiles.get(record.user)
                
                # Skip if user not found and not an admin user
                if not user_obj and request.user_role != 'super_admin':
                    logger.warning(f"User not found for attendance record: {record.user}")
                    continue
                
                user_data = {
                    "name": f"{user_obj.first_name} {user_obj.last_name}".strip() if user_obj else "Unknown",
                    "email": user_obj.email if user_obj else None,
                    "department": profile.department if profile else None
                }
                
                result.append({
                    "_id": str(record._id),
                    "user_id": user_obj.id if user_obj else None,
                    "user": user_data,
                    "date": record.date,
                    "time_in": record.time_in,
                    "time_out": record.time_out,
                    "status": record.status
                })
            
            logger.info(f"Returning {len(result)} attendance records")
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching attendance records: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChangePasswordView(APIView):
    def post(self, request):
        """Allow a user to change their password"""
        try:
            # Get user ID from request (set by middleware)
            user_id = request.user_id
            
            if not user_id:
                return Response({"error": "User ID not found in request"}, status=status.HTTP_400_BAD_REQUEST)
                
            # Get request data
            current_password = request.data.get('current_password')
            new_password = request.data.get('new_password')
            
            if not current_password or not new_password:
                return Response(
                    {"error": "Current password and new password are required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the Django user
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Verify current password
            if not user.check_password(current_password):
                return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(new_password)
            user.save()
            
            # Return success
            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error changing password: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserAttendanceView(APIView):
    def get(self, request, user_id):
        """Get attendance records for a specific user"""
        try:
            # Get the Django user
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Get query parameters for date filtering
            date_from = request.query_params.get('date_from')
            date_to = request.query_params.get('date_to')
            
            # Build query
            query = {'user': user.username}
            
            if date_from or date_to:
                if date_from:
                    try:
                        from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                        query['date__gte'] = from_date
                    except ValueError:
                        return Response({"error": "Invalid date_from format. Use YYYY-MM-DD"}, 
                                      status=status.HTTP_400_BAD_REQUEST)
                
                if date_to:
                    try:
                        to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                        query['date__lte'] = to_date
                    except ValueError:
                        return Response({"error": "Invalid date_to format. Use YYYY-MM-DD"}, 
                                      status=status.HTTP_400_BAD_REQUEST)
            
            # Get user profile for department information
            try:
                profile = UserProfile.objects.get(user=user.username)
                department = profile.department
            except UserProfile.DoesNotExist:
                department = None
            
            # Get attendance records
            attendance_records = list(Attendance.objects.filter(**query).order_by('-date'))
            
            # Prepare response
            result = []
            for record in attendance_records:
                result.append({
                    "_id": str(record._id),
                    "user_id": user_id,
                    "user": {
                        "name": f"{user.first_name} {user.last_name}".strip(),
                        "email": user.email,
                        "department": department
                    },
                    "date": record.date,
                    "time_in": record.time_in,
                    "time_out": record.time_out,
                    "status": record.status
                })
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching user attendance: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserDetailView(APIView):
    def get(self, request, user_id):
        """Get details of a specific user"""
        try:
            try:
                # Try to find the MongoDB profile by ObjectId
                if len(user_id) == 24:  # Valid ObjectId length
                    try:
                        profile = UserProfile.objects.get(_id=ObjectId(user_id))
                        django_user = User.objects.get(username=profile.user)
                    except (UserProfile.DoesNotExist, User.DoesNotExist):
                        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
                else:
                    # Try to find by Django ID
                    django_user = User.objects.get(id=user_id)
                    profile = UserProfile.objects.get(user=django_user.username)
            except (UserProfile.DoesNotExist, User.DoesNotExist):
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Prepare response
            user_data = {
                "_id": str(profile._id),
                "django_id": django_user.id,
                "name": f"{django_user.first_name} {django_user.last_name}".strip(),
                "email": django_user.email,
                "role": profile.role,
                "department": profile.department,
                "created_at": profile.created_at
            }
            
            return Response(user_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching user details: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, user_id):
        """Update user details"""
        try:
            data = request.data
            
            # Find the user by MongoDB ObjectId or Django ID
            try:
                if len(user_id) == 24:  # Valid ObjectId length
                    try:
                        profile = UserProfile.objects.get(_id=ObjectId(user_id))
                        django_user = User.objects.get(username=profile.user)
                    except (UserProfile.DoesNotExist, User.DoesNotExist):
                        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
                else:
                    # Try to find by Django ID
                    django_user = User.objects.get(id=user_id)
                    profile = UserProfile.objects.get(user=django_user.username)
            except (UserProfile.DoesNotExist, User.DoesNotExist):
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Update Django user fields
            if 'name' in data:
                name_parts = data['name'].split(' ')
                django_user.first_name = name_parts[0]
                django_user.last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            if 'email' in data:
                # Check if email is different and not already taken
                if data['email'] != django_user.email and User.objects.filter(email=data['email']).exists():
                    return Response({"error": "Email already in use"}, status=status.HTTP_400_BAD_REQUEST)
                django_user.email = data['email']
                django_user.username = data['email']  # Use email as username for consistency
            
            if 'password' in data and data['password']:
                django_user.set_password(data['password'])
            
            django_user.save()
            
            # Update profile fields
            if 'role' in data:
                profile.role = data['role']
            
            if 'department' in data:
                profile.department = data['department']
            
            profile.save()
            
            # Prepare response
            updated_user = {
                "_id": str(profile._id),
                "django_id": django_user.id,
                "name": f"{django_user.first_name} {django_user.last_name}".strip(),
                "email": django_user.email,
                "role": profile.role,
                "department": profile.department
            }
            
            return Response(updated_user, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, user_id):
        """Delete a user"""
        try:
            # Find the user by MongoDB ObjectId or Django ID
            try:
                if len(user_id) == 24:  # Valid ObjectId length
                    try:
                        profile = UserProfile.objects.get(_id=ObjectId(user_id))
                        django_user = User.objects.get(username=profile.user)
                    except (UserProfile.DoesNotExist, User.DoesNotExist):
                        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
                else:
                    # Try to find by Django ID
                    django_user = User.objects.get(id=user_id)
                    profile = UserProfile.objects.get(user=django_user.username)
            except (UserProfile.DoesNotExist, User.DoesNotExist):
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Store user details for response
            user_details = {
                "_id": str(profile._id),
                "django_id": django_user.id,
                "name": f"{django_user.first_name} {django_user.last_name}".strip(),
                "email": django_user.email
            }
            
            # Delete the user profile first (MongoDB)
            profile.delete()
            
            # Delete Django user
            django_user.delete()
            
            return Response({
                "message": "User deleted successfully",
                "user": user_details
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ClassListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, instructor_id=None):
        """Get classes for an instructor or all classes"""
        try:
            if instructor_id:
                # Get classes for specific instructor
                classes = Class.objects.filter(instructor=instructor_id)
            else:
                # Get all classes
                classes = Class.objects.all()
            
            serializer = ClassSerializer(classes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching classes: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create a new class"""
        try:
            serializer = ClassSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error creating class: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ScheduleListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, instructor_id=None):
        """Get schedules for an instructor or all schedules"""
        try:
            if instructor_id:
                # Get schedules for specific instructor
                schedules = Schedule.objects.filter(instructor=instructor_id)
            else:
                # Get all schedules
                schedules = Schedule.objects.all()
            
            serializer = ScheduleSerializer(schedules, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching schedules: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create a new schedule"""
        try:
            serializer = ScheduleSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error creating schedule: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
