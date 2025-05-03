from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from pymongo import MongoClient
from bson import ObjectId

# Initialize MongoDB client
client = MongoClient('mongodb://localhost:27017/')
db = client['attendance_system']

# Create your views here.

class BiometricDataView(APIView):
    def post(self, request):
        try:
            biometric_data = request.data
            biometric_data['id'] = str(ObjectId())  # Generate a unique ID
            db['biometric'].insert_one(biometric_data)  # Insert into the biometric collection
            return Response({"message": "Biometric data added successfully."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        try:
            biometric_data = list(db['biometric'].find())
            for data in biometric_data:
                data['_id'] = str(data['_id'])  # Convert ObjectId to string
                if 'user' in data and isinstance(data['user'], ObjectId):
                    data['user'] = str(data['user'])  # Convert user ObjectId to string
            return Response(biometric_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BiometricDataListView(APIView):
    def get(self, request):
        try:
            biometric_data = list(db['biometric'].find())
            for data in biometric_data:
                data['_id'] = str(data['_id'])  # Convert ObjectId to string
                if 'user' in data and isinstance(data['user'], ObjectId):
                    data['user'] = str(data['user'])  # Convert user ObjectId to string
            return Response(biometric_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BiometricDataDetailView(APIView):
    def get(self, request, id):
        try:
            biometric_data = db['biometric'].find_one({"_id": ObjectId(id)})
            if not biometric_data:
                return Response({"error": "Biometric data not found."}, status=status.HTTP_404_NOT_FOUND)
            biometric_data['_id'] = str(biometric_data['_id'])  # Convert ObjectId to string
            if 'user' in biometric_data and isinstance(biometric_data['user'], ObjectId):
                biometric_data['user'] = str(biometric_data['user'])  # Convert user ObjectId to string
            return Response(biometric_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        try:
            result = db['biometric'].delete_one({"_id": ObjectId(id)})
            if result.deleted_count == 0:
                return Response({"error": "Biometric data not found."}, status=status.HTTP_404_NOT_FOUND)
            return Response({"message": "Biometric data deleted successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        try:
            updated_data = request.data
            result = db['biometric'].update_one({"_id": ObjectId(id)}, {"$set": updated_data})
            if result.matched_count == 0:
                return Response({"error": "Biometric data not found."}, status=status.HTTP_404_NOT_FOUND)
            return Response({"message": "Biometric data updated successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
