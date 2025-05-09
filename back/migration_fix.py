import os
import django
from django.db import connection

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SAS_backend.settings')
django.setup()

# Import the migration recorder
from django.db.migrations.recorder import MigrationRecorder

def mark_migrations_as_applied():
    """
    Mark all migrations as applied without actually running them
    """
    print("Marking all migrations as applied...")
    
    # Get the MigrationRecorder
    recorder = MigrationRecorder(connection)
    Migration = recorder.Migration
    
    # Get all pending migrations
    from django.db.migrations.loader import MigrationLoader
    loader = MigrationLoader(connection)
    graph = loader.graph
    
    # Get applied migrations
    applied = recorder.applied_migrations()
    
    # Mark all migrations as applied
    to_apply = []
    for app_name, migration_name in graph.leaf_nodes():
        for migration in graph.forwards_plan((app_name, migration_name)):
            if migration not in applied:
                app, name = migration
                to_apply.append((app, name))
    
    # Apply migrations
    for app, name in to_apply:
        print(f"Marking {app}.{name} as applied")
        Migration.objects.create(app=app, name=name)
    
    print(f"Marked {len(to_apply)} migrations as applied.")

if __name__ == "__main__":
    mark_migrations_as_applied() 