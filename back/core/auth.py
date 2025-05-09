import hashlib
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User as DjangoUser
from .models import User as CustomUser
from bson import ObjectId
from django.db.models import CharField

class MongoDBBackend(BaseBackend):
    """
    Custom authentication backend for MongoDB
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate a user using MongoDB
        """
        try:
            # Get the user from MongoDB
            mongo_user = CustomUser.objects.get(email=username)
            
            # Hash the provided password
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
            
            # Check if the passwords match
            if mongo_user.password == hashed_password:
                # Instead of creating a Django User model, we'll create a simple wrapper object
                # that mimics the behavior Django expects but doesn't require database operations
                user = InMemoryUser(
                    id=str(mongo_user._id),
                    username=mongo_user.email,
                    email=mongo_user.email,
                    name=mongo_user.name,
                    role=mongo_user.role
                )
                
                # Store MongoDB user_id in session
                if hasattr(request, 'session'):
                    request.session['mongodb_user_id'] = str(mongo_user._id)
                    request.session['mongodb_user_role'] = mongo_user.role
                    request.session['mongodb_user_name'] = mongo_user.name
                
                return user
        except CustomUser.DoesNotExist:
            return None
        
        return None
    
    def get_user(self, user_id):
        """
        Get a user by ID - we use the session to retrieve the MongoDB user info
        """
        try:
            # Find user in MongoDB
            mongo_user = CustomUser.objects.get(_id=ObjectId(user_id))
            
            # Create an in-memory user
            return InMemoryUser(
                id=str(mongo_user._id),
                username=mongo_user.email,
                email=mongo_user.email,
                name=mongo_user.name,
                role=mongo_user.role
            )
        except (CustomUser.DoesNotExist, Exception):
            return None


# Create a simple mock for _meta required by Django's login function
class MockMeta:
    def __init__(self, pk_name='id'):
        self.pk = MockField(pk_name)

class MockField:
    def __init__(self, name):
        self.name = name
        
    def value_to_string(self, model_instance):
        return str(getattr(model_instance, self.name))


class InMemoryUser:
    """
    In-memory user class that mimics Django's User model but doesn't require database
    """
    def __init__(self, id, username, email, name, role):
        self.id = id
        self.pk = id  # Django uses pk as an alias for id
        self.username = username
        self.email = email
        self.name = name
        self.role = role
        
        # Set these attributes to mimic Django's User model
        self.is_authenticated = True
        self.is_active = True
        
        # Set staff/superuser based on role
        self.is_staff = role in ["super_admin", "admin_official"]
        self.is_superuser = role == "super_admin"
        
        # Add _meta attribute that Django's login function requires
        self._meta = MockMeta()
    
    def __str__(self):
        return self.username
    
    def has_perm(self, perm, obj=None):
        """
        Simple permission check - superusers have all permissions
        """
        if self.is_superuser:
            return True
        
        # Implement role-based permissions here
        return False
    
    def has_module_perms(self, app_label):
        """
        Check if user has permission to access an app/module
        """
        if self.is_superuser:
            return True
        
        # Implement role-based permissions here
        if app_label == 'core' and self.is_staff:
            return True
            
        return False
    
    def save(self, *args, **kwargs):
        """
        This method is required by Django but does nothing in our case
        """
        pass 