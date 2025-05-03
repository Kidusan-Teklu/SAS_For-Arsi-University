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

class GenerateReportView(APIView):
    def post(self, request):
        try:
            data = request.data
            
            # Validate required fields
            required_fields = ['report_type', 'start_date', 'end_date']
            for field in required_fields:
                if field not in data:
                    return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create report record
            report_data = {
                "user": ObjectId(data['user']) if 'user' in data else None,
                "report_type": data['report_type'],
                "start_date": datetime.fromisoformat(data['start_date'].replace('Z', '+00:00')),
                "end_date": datetime.fromisoformat(data['end_date'].replace('Z', '+00:00')),
                "created_at": datetime.utcnow()
            }
            
            # Insert report record
            result = db['core_report'].insert_one(report_data)
            
            return Response({"message": "Report generated successfully"}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetAllReportsView(APIView):
    def get(self, request):
        try:
            # Get query parameters
            user_id = request.query_params.get('user')
            report_type = request.query_params.get('report_type')
            
            # Build query
            query = {}
            if user_id:
                query['user'] = ObjectId(user_id)
            if report_type:
                query['report_type'] = report_type
            
            # Get reports
            reports = list(db['core_report'].find(query))
            
            # Convert records to JSON-serializable format
            serialized_reports = json.loads(json.dumps(reports, cls=MongoJSONEncoder))
            
            return Response(serialized_reports, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
