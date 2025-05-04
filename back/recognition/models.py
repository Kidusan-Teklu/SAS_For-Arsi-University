from django.db import models
from core.models import User
from django.utils.timezone import now
import json

class Recognition(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recognition_data")
    image_data = models.TextField()  # Base64 encoded image data
    face_encoding = models.TextField(null=True, blank=True)  # JSON string of face encoding numpy array
    timestamp = models.DateTimeField(default=now)
    confidence_score = models.FloatField(default=0.0)  # Confidence score for the face encoding
    
    def set_face_encoding(self, encoding):
        """Convert numpy array to JSON string for storage"""
        if encoding is not None:
            self.face_encoding = json.dumps(encoding.tolist())
    
    def get_face_encoding(self):
        """Convert JSON string back to numpy array"""
        import numpy as np
        if self.face_encoding:
            return np.array(json.loads(self.face_encoding))
        return None

    def __str__(self):
        return f"Recognition data for {self.user.name} at {self.timestamp}"
