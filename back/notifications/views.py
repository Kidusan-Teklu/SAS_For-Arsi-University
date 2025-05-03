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

class NotificationView(APIView):
    def post(self, request):
        try:
            data = request.data
            
            # Validate required fields
            required_fields = ['recipient', 'message']
            for field in required_fields:
                if field not in data:
                    return Response({"error": f"{field} is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create notification record
            notification = {
                "recipient": ObjectId(data['recipient']),
                "message": data['message'],
                "read": False,
                "created_at": datetime.utcnow()
            }
            
            # Insert notification record
            result = db['notifications'].insert_one(notification)
            
            # Use the new _id to query the inserted document
            inserted_id = result.inserted_id
            new_notification = db['notifications'].find_one({"_id": inserted_id})
            
            # Add an 'id' field that is a string version of _id for frontend compatibility
            if new_notification:
                new_notification['id'] = str(new_notification['_id'])
            
            # Convert to JSON-serializable format
            serialized_notification = json.loads(json.dumps(new_notification, cls=MongoJSONEncoder))
            
            return Response({"message": "Notification sent successfully", "data": serialized_notification}, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        try:
            # Get query parameters
            recipient_id = request.query_params.get('recipient')
            read_status = request.query_params.get('read')
            
            # Build query
            query = {}
            if recipient_id:
                query['recipient'] = ObjectId(recipient_id)
            if read_status:
                query['read'] = read_status.lower() == 'true'
            
            # Get notifications
            notifications = list(db['notifications'].find(query).sort('created_at', -1))
            
            # Add 'id' field for frontend compatibility
            for notification in notifications:
                notification['id'] = str(notification['_id'])
            
            # Convert to JSON-serializable format
            serialized_notifications = json.loads(json.dumps(notifications, cls=MongoJSONEncoder))
            
            return Response(serialized_notifications, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class NotificationDetailView(APIView):
    def get(self, request, notification_id):
        try:
            # Get notification by ID
            notification = db['notifications'].find_one({"_id": ObjectId(notification_id)})
            
            if not notification:
                return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Add 'id' field for frontend compatibility
            notification['id'] = str(notification['_id'])
            
            # Convert to JSON-serializable format
            serialized_notification = json.loads(json.dumps(notification, cls=MongoJSONEncoder))
            
            return Response(serialized_notification, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, notification_id):
        try:
            data = request.data
            
            # Get notification by ID
            notification = db['notifications'].find_one({"_id": ObjectId(notification_id)})
            
            if not notification:
                return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Update notification
            update_data = {}
            if 'read' in data:
                update_data['read'] = data['read']
            
            if update_data:
                db['notifications'].update_one(
                    {"_id": ObjectId(notification_id)},
                    {"$set": update_data}
                )
            
            return Response({"message": "Notification updated successfully"}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, notification_id):
        try:
            # Get notification by ID
            notification = db['notifications'].find_one({"_id": ObjectId(notification_id)})
            
            if not notification:
                return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Delete notification
            db['notifications'].delete_one({"_id": ObjectId(notification_id)})
            
            return Response({"message": "Notification deleted successfully"}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
