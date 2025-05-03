from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import json
from api.views import MongoJSONEncoder

# Initialize MongoDB client
client = MongoClient('mongodb://localhost:27017/')
db = client['attendance_system']

# Create your views here.

class ScheduleView(APIView):
    def post(self, request):
        try:
            data = request.data
            
            # Validate required fields
            required_fields = ['title', 'date', 'time', 'department']
            for field in required_fields:
                if field not in data:
                    return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create schedule record
            schedule = {
                "title": data['title'],
                "description": data.get('description', ''),
                "date": data['date'],
                "time": data['time'],
                "department": data['department'],
                "batch": data.get('batch', ''),
                "classroom": data.get('classroom'),
                "created_at": datetime.utcnow()
            }
            
            # Insert schedule record
            result = db['schedules'].insert_one(schedule)
            
            return Response({"message": "Schedule created successfully"}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        try:
            # Get query parameters
            department = request.query_params.get('department')
            date = request.query_params.get('date')
            
            # Build query
            query = {}
            if department:
                query['department'] = department
            if date:
                query['date'] = date
            
            # Get schedules
            schedules = list(db['schedules'].find(query))
            
            # Convert to JSON-serializable format
            serialized_schedules = json.loads(json.dumps(schedules, cls=MongoJSONEncoder))
            
            return Response(serialized_schedules, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ScheduleDetailView(APIView):
    def get(self, request, schedule_id):
        try:
            # Get schedule by ID
            schedule = db['schedules'].find_one({"_id": ObjectId(schedule_id)})
            
            if not schedule:
                return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Convert to JSON-serializable format
            serialized_schedule = json.loads(json.dumps(schedule, cls=MongoJSONEncoder))
            
            return Response(serialized_schedule, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, schedule_id):
        try:
            data = request.data
            
            # Get schedule by ID
            schedule = db['schedules'].find_one({"_id": ObjectId(schedule_id)})
            
            if not schedule:
                return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Update schedule
            update_data = {}
            for field in ['title', 'description', 'date', 'time', 'department', 'batch', 'classroom']:
                if field in data:
                    update_data[field] = data[field]
            
            if update_data:
                db['schedules'].update_one(
                    {"_id": ObjectId(schedule_id)},
                    {"$set": update_data}
                )
            
            return Response({"message": "Schedule updated successfully"}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, schedule_id):
        try:
            # Get schedule by ID
            schedule = db['schedules'].find_one({"_id": ObjectId(schedule_id)})
            
            if not schedule:
                return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Delete schedule
            db['schedules'].delete_one({"_id": ObjectId(schedule_id)})
            
            return Response({"message": "Schedule deleted successfully"}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
