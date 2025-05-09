from django.utils.deprecation import MiddlewareMixin
from .models import User
from bson import ObjectId
from .auth import InMemoryUser

class MongoDBAuthMiddleware(MiddlewareMixin):
    """
    Middleware that attaches MongoDB user data to the request
    """
    def process_request(self, request):
        # Skip for admin URLs to avoid conflicts with Django auth
        if request.path.startswith('/admin/'):
            return None
            
        # If request already has mongodb_user attribute, skip
        if hasattr(request, 'mongodb_user'):
            return None
        
        # Get MongoDB user ID from session
        mongodb_user_id = request.session.get('mongodb_user_id')
        
        if mongodb_user_id:
            try:
                # Get MongoDB user
                mongodb_user = User.objects.get(_id=ObjectId(mongodb_user_id))
                
                # Create an in-memory user
                request.mongodb_user = InMemoryUser(
                    id=str(mongodb_user._id),
                    username=mongodb_user.email,
                    email=mongodb_user.email,
                    name=mongodb_user.name,
                    role=mongodb_user.role
                )
                
                # For compatibility with Django templates and views
                if request.session.get('is_authenticated', False):
                    request.user = request.mongodb_user
            except Exception:
                request.mongodb_user = None
                # Clear invalid session data
                if 'mongodb_user_id' in request.session:
                    del request.session['mongodb_user_id']
                if 'is_authenticated' in request.session:
                    del request.session['is_authenticated']
        else:
            request.mongodb_user = None
            
        return None 