from django.db import models
from django.contrib.auth.models import User as DjangoUser
from .models import User as CustomUser

class MongoDBUserProxy(models.Model):
    """
    A proxy model that connects Django's built-in User model to our MongoDB User model.
    This allows us to manage MongoDB users through the Django admin interface.
    """
    django_user = models.OneToOneField(DjangoUser, on_delete=models.CASCADE, related_name='mongodb_user')
    mongodb_user_id = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return f"{self.django_user.username} -> MongoDB User"
    
    class Meta:
        verbose_name = "MongoDB User"
        verbose_name_plural = "MongoDB Users"
        app_label = 'core' 