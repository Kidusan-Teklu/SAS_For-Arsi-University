import cv2
import face_recognition
import numpy as np
import base64
import io
from PIL import Image

class FaceRecognizer:
    """Utility class for face recognition operations using OpenCV and face_recognition library"""
    
    def __init__(self):
        # Set the tolerance for face recognition (lower is more strict)
        # This is the maximum distance between two face embeddings for them to be considered a match
        self.tolerance = 0.6
        
        # Set the face detection model to use
        # Options: 'hog' (faster but less accurate) or 'cnn' (more accurate but requires GPU)
        self.model = 'hog'
    
    def extract_face_encodings(self, image_data):
        """Extract face encoding from image data (base64 or file)"""
        try:
            # If image_data is base64
            if isinstance(image_data, str) and image_data.startswith('data:image'):
                # Extract the base64 encoded data
                image_data = image_data.split(',')[1]
                
                # Decode base64 string to image
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
                
                # Convert PIL Image to numpy array
                image_array = np.array(image)
                
                # Convert RGB to BGR (OpenCV format)
                if len(image_array.shape) == 3 and image_array.shape[2] == 3:
                    image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
            else:
                # Assume image_data is file path or already a numpy array
                image_array = image_data if isinstance(image_data, np.ndarray) else cv2.imread(image_data)
            
            # Convert BGR to RGB (face_recognition expects RGB)
            rgb_image = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
            
            # Find all face locations in the image
            face_locations = face_recognition.face_locations(rgb_image, model=self.model)
            
            if not face_locations:
                return None, "No faces detected in the image"
            
            # Get face encodings for each face detected
            face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
            
            if not face_encodings:
                return None, "Could not encode the detected face"
            
            # Return the first face encoding (assuming one face per image)
            return face_encodings[0], None
            
        except Exception as e:
            return None, str(e)
    
    def compare_faces(self, known_encoding, unknown_encoding):
        """
        Compare a known face encoding with an unknown face encoding
        Returns:
            - match (bool): True if faces match, False otherwise
            - confidence (float): Confidence score (lower distance = higher confidence)
        """
        if known_encoding is None or unknown_encoding is None:
            return False, 0.0
        
        # Calculate face distance (lower = more similar)
        face_distances = face_recognition.face_distance([known_encoding], unknown_encoding)
        
        if len(face_distances) == 0:
            return False, 0.0
        
        face_distance = face_distances[0]
        
        # Convert distance to confidence (100% - distance*100)
        # Distance of 0 = 100% confidence, Distance of 1 = 0% confidence
        confidence = max(0, min(100, (1 - face_distance) * 100))
        
        # Match if distance is less than tolerance
        match = face_distance <= self.tolerance
        
        return match, confidence
    
    def process_verification(self, registered_faces, unknown_face):
        """
        Verify if the unknown face matches any of the registered faces
        
        Args:
            registered_faces (list): List of known face encodings
            unknown_face (str/numpy.array): Unknown face image (base64 or numpy array)
            
        Returns:
            dict: Results of verification including match status and confidence
        """
        # Extract face encoding from the unknown face
        unknown_encoding, error = self.extract_face_encodings(unknown_face)
        
        if error:
            return {
                "verified": False,
                "confidence": 0.0,
                "error": error
            }
        
        # No registered faces to compare with
        if not registered_faces or len(registered_faces) == 0:
            return {
                "verified": False,
                "confidence": 0.0,
                "error": "No registered faces to compare against"
            }
        
        # Compare with each registered face and get the best match
        best_match = False
        highest_confidence = 0.0
        
        for face_encoding in registered_faces:
            match, confidence = self.compare_faces(face_encoding, unknown_encoding)
            
            if match and confidence > highest_confidence:
                best_match = True
                highest_confidence = confidence
        
        return {
            "verified": best_match,
            "confidence": highest_confidence,
            "error": None
        } 