from django.db import models

class BiometricData(models.Model):
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name="biometric_data")
    biometric_type = models.CharField(max_length=50)
    data = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.name} - {self.biometric_type}"
