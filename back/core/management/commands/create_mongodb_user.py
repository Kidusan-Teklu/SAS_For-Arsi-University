from django.core.management.base import BaseCommand
import hashlib
from core.models import User

class Command(BaseCommand):
    help = 'Create a new MongoDB user with specified role'

    def add_arguments(self, parser):
        parser.add_argument('name', type=str, help='Full name of the user')
        parser.add_argument('email', type=str, help='Email address (will be used as username)')
        parser.add_argument('password', type=str, help='User password')
        parser.add_argument('role', type=str, 
                           choices=['super_admin', 'admin_official', 'student', 'employee', 'instructor', 'dept_head'],
                           help='User role')

    def handle(self, *args, **options):
        name = options['name']
        email = options['email']
        password = options['password']
        role = options['role']
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f'User with email {email} already exists!'))
            return
        
        # Hash the password
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        # Create the user
        user = User(
            name=name,
            email=email,
            password=hashed_password,
            role=role
        )
        user.save()
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {role} user: {name} ({email})')) 