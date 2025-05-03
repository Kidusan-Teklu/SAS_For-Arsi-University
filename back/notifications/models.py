from django.db import models
from core.models import User
from django.utils.timezone import now

class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications_notifications")
    message = models.TextField()
    sent_at = models.DateTimeField(default=now)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification to {self.recipient.name} at {self.sent_at}"
