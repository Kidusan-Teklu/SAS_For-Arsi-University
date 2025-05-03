from django.db import models

class Attendance(models.Model):
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name="attendance_app_records")
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=[
        ("present", "Present"),
        ("absent", "Absent"),
        ("late", "Late"),
        ("excused", "Excused"),
    ])

    def __str__(self):
        return f"{self.user.name} - {self.date} ({self.status})"
