from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pymongo import MongoClient
from bson import ObjectId
import logging
from datetime import datetime, date
import json
from api.views import MongoJSONEncoder

logger = logging.getLogger(__name__)

# Initialize MongoDB client
client = MongoClient('mongodb://localhost:27017/')
db = client['attendance_system']

# Create your views here.

class MarkAttendanceView(APIView):
    def post(self, request):
        try:
            data = request.data
            
            # Validate required fields
            required_fields = ['user', 'date', 'status']
            for field in required_fields:
                if field not in data:
                    return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle date properly
            try:
                # If date is passed as string, convert to datetime object
                if isinstance(data['date'], str):
                    data['date'] = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            except ValueError:
                return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create attendance record
            attendance_record = {
                "user": ObjectId(data['user']),
                "date": data['date'],
                "time_in": data.get('time_in'),
                "time_out": data.get('time_out'),
                "status": data['status'],
                "created_at": datetime.utcnow()
            }
            
            result = db['attendance'].insert_one(attendance_record)
            
            # Return success response
            return Response({"message": "Attendance marked successfully"}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetAllAttendanceView(APIView):
    def get(self, request):
        try:
            # Get query parameters
            user_id = request.query_params.get('user')
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            # Build query
            query = {}
            if user_id:
                query['user'] = ObjectId(user_id)
                
            if start_date and end_date:
                query['date'] = {
                    '$gte': datetime.fromisoformat(start_date.replace('Z', '+00:00')),
                    '$lte': datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                }
            
            # Get attendance records
            attendance_records = list(db['attendance'].find(query))
            
            # Convert records to JSON-serializable format
            serialized_records = json.loads(json.dumps(attendance_records, cls=MongoJSONEncoder))
            
            return Response(serialized_records, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserAttendanceView(APIView):
    def get(self, request, user_id):
        try:
            # Convert user_id string to ObjectId
            user_oid = ObjectId(user_id)
            
            # Get query parameters
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            # Build query
            query = {'user': user_oid}
            
            if start_date and end_date:
                try:
                    start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                    end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                    query['date'] = {'$gte': start, '$lte': end}
                except ValueError:
                    return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get attendance records
            attendance_records = list(db['attendance'].find(query))
            
            # Convert records to JSON-serializable format
            serialized_records = json.loads(json.dumps(attendance_records, cls=MongoJSONEncoder))
            
            return Response(serialized_records, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
