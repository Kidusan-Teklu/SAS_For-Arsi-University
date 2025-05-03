from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pymongo import MongoClient
from bson import ObjectId
import base64
import random  # For simulating verification in test environment

# Initialize MongoDB client
client = MongoClient('mongodb://localhost:27017/')
db = client['attendance_system']

class RecognitionDataView(APIView):
    def post(self, request):
        try:
            recognition_data = request.data
            user_id = recognition_data.get('user')

            # Convert user_id to ObjectId
            try:
                user_id = ObjectId(user_id)
            except Exception:
                return Response({"error": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)

            # Check if the user is a student in the core_users collection
            user = db['core_users'].find_one({"_id": user_id, "role": "student"})

            if not user:
                return Response({"error": "User is not a student."}, status=status.HTTP_400_BAD_REQUEST)

            recognition_data['id'] = str(ObjectId())  # Generate a unique ID
            db['recognition'].insert_one(recognition_data)  # Insert into the recognition collection
            return Response({"message": "Recognition data added successfully."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class RecognitionDataListView(APIView):
    def get(self, request):
        try:
            # Retrieve recognition data for all students
            recognition_data = list(db['recognition'].find())
            for data in recognition_data:
                data['_id'] = str(data['_id'])  # Convert ObjectId to string
                if 'user' in data and isinstance(data['user'], ObjectId):
                    data['user'] = str(data['user'])  # Convert user ObjectId to string
            return Response(recognition_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class FaceVerificationView(APIView):
    def post(self, request):
        try:
            # Extract data from request
            user_id = request.data.get('user_id')
            image_data = request.data.get('image_data')
            
            if not user_id or not image_data:
                return Response(
                    {"error": "User ID and image data are required."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Convert user_id to ObjectId if it's not already
            try:
                if isinstance(user_id, str):
                    user_id = ObjectId(user_id)
            except Exception:
                return Response(
                    {"error": "Invalid user ID format."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # For a real implementation, here you would:
            # 1. Retrieve the user's stored face images from the database
            # 2. Use a face recognition library (like face_recognition) to compare the images
            # 3. Return the verification result
            
            # For this demonstration, we'll simulate verification with random success (80% success rate)
            # In a production environment, replace this with actual face recognition logic
            is_verified = random.random() < 0.8
            
            return Response(
                {"verified": is_verified}, 
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
