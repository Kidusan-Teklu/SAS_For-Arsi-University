from .models import User as CustomUser
from bson import ObjectId

def mongodb_user(request):
    """
    Context processor to add MongoDB user to the template context
    """
    context = {
        'mongodb_user': None,
        'mongodb_user_role': None,
        'mongodb_user_name': None,
    }
    
    # If request has a mongodb_user attribute, use it
    if hasattr(request, 'mongodb_user') and request.mongodb_user:
        context['mongodb_user'] = request.mongodb_user
        context['mongodb_user_role'] = request.mongodb_user.role
        context['mongodb_user_name'] = request.mongodb_user.name
    # Otherwise, try to get it from session
    elif request.session.get('mongodb_user_id'):
        try:
            user = CustomUser.objects.get(_id=ObjectId(request.session['mongodb_user_id']))
            context['mongodb_user'] = user
            context['mongodb_user_role'] = user.role
            context['mongodb_user_name'] = user.name
        except:
            pass
    
    return context 