class DatabaseRouter:
    """
    Database router that sends Django internal models to SQLite
    and application models to MongoDB
    """
    
    def db_for_read(self, model, **hints):
        """
        Route read operations to the appropriate database
        """
        # Django's auth models go to the internal database
        if model._meta.app_label == 'auth' or model._meta.app_label == 'admin' or model._meta.app_label == 'contenttypes' or model._meta.app_label == 'sessions':
            return 'django_internal'
        
        # All other models use MongoDB
        return 'default'
    
    def db_for_write(self, model, **hints):
        """
        Route write operations to the appropriate database
        """
        # Django's auth models go to the internal database
        if model._meta.app_label == 'auth' or model._meta.app_label == 'admin' or model._meta.app_label == 'contenttypes' or model._meta.app_label == 'sessions':
            return 'django_internal'
        
        # All other models use MongoDB
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations between objects in the same database
        """
        # Check if both objects are in the same database
        db1 = self.db_for_read(obj1.__class__)
        db2 = self.db_for_read(obj2.__class__)
        
        if db1 and db2 and db1 == db2:
            return True
        
        return None
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Control which models can migrate to which database
        """
        # Django's auth models go to the internal database
        if app_label == 'auth' or app_label == 'admin' or app_label == 'contenttypes' or app_label == 'sessions':
            return db == 'django_internal'
        
        # All other models use MongoDB (but with no migrations)
        if db == 'default':
            return False  # Don't run migrations on MongoDB
        
        return None 