from django.db import models
from core.models import User
from django.utils.timezone import now

class Recognition(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recognition_data")
    image_data = models.TextField()
    timestamp = models.DateTimeField(default=now)

    def __str__(self):
        return f"Recognition data for {self.user.name} at {self.timestamp}"
