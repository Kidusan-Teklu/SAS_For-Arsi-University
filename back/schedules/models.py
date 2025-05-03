from django.db import models
from django.utils.timezone import now

class Schedule(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(default="class schedule")
    date = models.DateField(default=now)
    time = models.TimeField(default="09:00:00")
    department = models.CharField(max_length=255, default="Computer science")
    batch = models.CharField(max_length=255, default="4th year")
    classroom = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.title} - {self.department} ({self.batch})"
