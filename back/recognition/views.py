from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pymongo import MongoClient
from bson import ObjectId
import base64
import random  # For simulating verification in test environment
from .face_utils import FaceRecognizer

# Initialize MongoDB client
client = MongoClient('mongodb://localhost:27017/')
db = client['attendance_system']

# Initialize face recognizer
face_recognizer = FaceRecognizer()

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
            
            # Process the face image to extract face encoding
            image_data = recognition_data.get('image_data')
            face_encoding, error = face_recognizer.extract_face_encodings(image_data)
            
            if error:
                return Response({"error": f"Failed to process face: {error}"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Add new fields to recognition data
            recognition_data['id'] = str(ObjectId())  # Generate a unique ID
            
            # Convert face encoding to list for MongoDB storage if it exists
            if face_encoding is not None:
                recognition_data['face_encoding'] = face_encoding.tolist()
                recognition_data['has_encoding'] = True
            else:
                recognition_data['has_encoding'] = False
            
            db['recognition'].insert_one(recognition_data)  # Insert into the recognition collection
            
            return Response({
                "message": "Recognition data added successfully.",
                "has_encoding": recognition_data['has_encoding']
            }, status=status.HTTP_201_CREATED)
            
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
                
                # Remove face encoding from response to reduce size
                if 'face_encoding' in data:
                    del data['face_encoding']
                    
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
            
            # For test users (those with email test.*@example.com), use simulation
            user = db['core_users'].find_one({"_id": user_id})
            if user and 'email' in user and user['email'].startswith('test.') and user['email'].endswith('@example.com'):
                # Simulate verification with random success (80% success rate)
                is_verified = random.random() < 0.8
                confidence = random.uniform(70, 99) if is_verified else random.uniform(30, 60)
                
                return Response({
                    "verified": is_verified,
                    "confidence": round(confidence, 2),
                    "simulation": True
                }, status=status.HTTP_200_OK)
            
            # Get all face recognition data for the user
            registered_faces = list(db['recognition'].find({"user": user_id, "has_encoding": True}))
            
            if not registered_faces:
                return Response({
                    "verified": False,
                    "confidence": 0,
                    "error": "No registered face data found for this user."
                }, status=status.HTTP_200_OK)
            
            # Extract face encodings from the database records
            face_encodings = []
            for face_data in registered_faces:
                if 'face_encoding' in face_data and face_data['face_encoding']:
                    import numpy as np
                    face_encodings.append(np.array(face_data['face_encoding']))
            
            # Process verification using our face recognizer
            verification_result = face_recognizer.process_verification(face_encodings, image_data)
            
            # Return verification result
            return Response({
                "verified": verification_result["verified"],
                "confidence": round(verification_result["confidence"], 2),
                "error": verification_result["error"]
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserFaceImagesView(APIView):
    def get(self, request, user_id):
        try:
            # Convert user_id to ObjectId
            try:
                user_id = ObjectId(user_id)
            except Exception:
                return Response({"error": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get all face images for the user
            face_images = list(db['recognition'].find({"user": user_id}))
            
            # Transform data for frontend
            result = []
            for img in face_images:
                # Keep only necessary fields
                result.append({
                    "id": img.get("id", str(img["_id"])),
                    "url": img.get("image_data", ""),  # This would contain the base64 image data
                    "uploaded_at": img.get("timestamp", ""),
                    "has_encoding": img.get("has_encoding", False),
                    "confidence_score": img.get("confidence_score", 0)
                })
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, user_id):
        try:
            # Extract the image ID to delete from the user_id path parameter
            # In this case, user_id is actually being used as the image ID
            image_id = user_id
            
            # Delete the face image
            result = db['recognition'].delete_one({"id": image_id})
            
            if result.deleted_count == 0:
                return Response({"error": "Image not found."}, status=status.HTTP_404_NOT_FOUND)
            
            return Response({"message": "Image deleted successfully."}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
