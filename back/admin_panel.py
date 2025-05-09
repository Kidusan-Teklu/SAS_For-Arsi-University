import os
import json
import uuid
import hashlib
import secrets
import string
import argparse
import getpass
from datetime import datetime
from colorama import init, Fore, Style

# Initialize colorama for colored terminal output
init()

class AdminPanel:
    def __init__(self, users_file='admin_users.json', students_file='students_data.json'):
        """Initialize the admin panel"""
        self.users_file = users_file
        self.students_file = students_file
        self.admin_users = []
        self.students = []
        self.current_user = None
        
        # Load admin users if file exists
        if os.path.exists(self.users_file):
            try:
                with open(self.users_file, 'r') as f:
                    self.admin_users = json.load(f)
            except:
                print(f"{Fore.RED}Error loading admin users. Starting with empty list.{Style.RESET_ALL}")
        
        # Create default admin if no users exist
        if not self.admin_users:
            self._create_default_admin()
        
        # Load students if file exists
        if os.path.exists(self.students_file):
            try:
                with open(self.students_file, 'r') as f:
                    self.students = json.load(f)
            except:
                print(f"{Fore.RED}Error loading students data. Starting with empty list.{Style.RESET_ALL}")
    
    def _create_default_admin(self):
        """Create a default admin user"""
        default_admin = {
            "username": "admin",
            "password_hash": self._hash_password("admin123"),
            "email": "admin@example.com",
            "role": "superadmin",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "last_login": None,
            "must_change_password": True
        }
        
        self.admin_users.append(default_admin)
        self._save_admin_users()
        print(f"{Fore.YELLOW}Created default admin user.{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Username: admin, Password: admin123{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Please change the default password after login.{Style.RESET_ALL}")
    
    def _hash_password(self, password):
        """Hash a password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def _save_admin_users(self):
        """Save admin users to file"""
        with open(self.users_file, 'w') as f:
            json.dump(self.admin_users, f, indent=4)
    
    def _save_students(self):
        """Save students to file"""
        with open(self.students_file, 'w') as f:
            json.dump(self.students, f, indent=4)
    
    def _generate_otp(self, length=8):
        """Generate a random one-time password"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    def login(self):
        """Login to the admin panel"""
        print(f"\n{Fore.CYAN}===== ADMIN LOGIN ====={Style.RESET_ALL}")
        
        attempts = 3
        while attempts > 0:
            username = input("Username: ")
            password = getpass.getpass("Password: ")
            
            # Find the user
            user = next((u for u in self.admin_users if u["username"] == username), None)
            
            if user and user["password_hash"] == self._hash_password(password):
                # Update last login
                user["last_login"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                self._save_admin_users()
                
                # Set current user
                self.current_user = user
                
                print(f"\n{Fore.GREEN}Login successful. Welcome, {username}!{Style.RESET_ALL}")
                
                # Check if password change is required
                if user.get("must_change_password", False):
                    print(f"\n{Fore.YELLOW}You must change your password.{Style.RESET_ALL}")
                    self.change_password()
                
                return True
            
            attempts -= 1
            print(f"{Fore.RED}Invalid username or password. {attempts} attempts remaining.{Style.RESET_ALL}")
        
        print(f"\n{Fore.RED}Too many failed attempts. Exiting.{Style.RESET_ALL}")
        return False
    
    def change_password(self):
        """Change the current user's password"""
        if not self.current_user:
            print(f"{Fore.RED}You must be logged in to change your password.{Style.RESET_ALL}")
            return False
        
        print(f"\n{Fore.CYAN}===== CHANGE PASSWORD ====={Style.RESET_ALL}")
        
        # If must_change_password is True, don't ask for current password
        if not self.current_user.get("must_change_password", False):
            current_password = getpass.getpass("Current password: ")
            
            # Verify current password
            if self._hash_password(current_password) != self.current_user["password_hash"]:
                print(f"{Fore.RED}Incorrect password.{Style.RESET_ALL}")
                return False
        
        # Get new password
        while True:
            new_password = getpass.getpass("New password (min 8 characters): ")
            
            if len(new_password) < 8:
                print(f"{Fore.RED}Password must be at least 8 characters.{Style.RESET_ALL}")
                continue
            
            confirm_password = getpass.getpass("Confirm new password: ")
            
            if new_password != confirm_password:
                print(f"{Fore.RED}Passwords don't match.{Style.RESET_ALL}")
                continue
            
            break
        
        # Update password
        self.current_user["password_hash"] = self._hash_password(new_password)
        self.current_user["must_change_password"] = False
        self._save_admin_users()
        
        print(f"{Fore.GREEN}Password changed successfully.{Style.RESET_ALL}")
        return True
    
    def create_admin(self):
        """Create a new admin user"""
        if not self.current_user or self.current_user["role"] != "superadmin":
            print(f"{Fore.RED}You must be a superadmin to create admin users.{Style.RESET_ALL}")
            return False
        
        print(f"\n{Fore.CYAN}===== CREATE ADMIN USER ====={Style.RESET_ALL}")
        
        username = input("Username: ")
        
        # Check if username exists
        if any(u["username"] == username for u in self.admin_users):
            print(f"{Fore.RED}Username already exists.{Style.RESET_ALL}")
            return False
        
        email = input("Email: ")
        
        # Generate random password
        password = self._generate_otp()
        
        # Create admin user
        admin_user = {
            "username": username,
            "password_hash": self._hash_password(password),
            "email": email,
            "role": "admin",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "last_login": None,
            "must_change_password": True
        }
        
        self.admin_users.append(admin_user)
        self._save_admin_users()
        
        print(f"\n{Fore.GREEN}Admin user created successfully.{Style.RESET_ALL}")
        print(f"Username: {username}")
        print(f"Temporary password: {password}")
        print("The user will be prompted to change this password on first login.")
        
        return True
    
    def list_admins(self):
        """List all admin users"""
        if not self.current_user:
            print(f"{Fore.RED}You must be logged in to list admin users.{Style.RESET_ALL}")
            return False
        
        print(f"\n{Fore.CYAN}===== ADMIN USERS ====={Style.RESET_ALL}")
        
        for i, user in enumerate(self.admin_users, 1):
            print(f"{i}. Username: {user['username']}")
            print(f"   Email: {user['email']}")
            print(f"   Role: {user['role']}")
            print(f"   Created: {user['created_at']}")
            print(f"   Last login: {user['last_login'] or 'Never'}")
            print()
        
        return True
    
    def create_student(self):
        """Create a new student account with one-time password"""
        if not self.current_user:
            print(f"{Fore.RED}You must be logged in to create student accounts.{Style.RESET_ALL}")
            return False
        
        print(f"\n{Fore.CYAN}===== CREATE STUDENT ACCOUNT ====={Style.RESET_ALL}")
        
        # Get student information
        name = input("Full name: ")
        
        # Generate ID
        while True:
            id_number = input("ID number (e.g., ETH001): ")
            
            # Check if ID exists
            if any(s["id"] == id_number for s in self.students):
                print(f"{Fore.RED}ID already exists. Please use a different ID.{Style.RESET_ALL}")
                continue
            
            break
        
        department = input("Department: ")
        email = input("Email: ")
        
        # Generate one-time password
        otp = self._generate_otp()
        
        # Create student
        student = {
            "id": id_number,
            "name": name,
            "department": department,
            "email": email,
            "registration_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "images": [],
            "password_hash": self._hash_password(otp),
            "must_change_password": True,
            "last_login": None,
            "attendance_records": []
        }
        
        self.students.append(student)
        self._save_students()
        
        print(f"\n{Fore.GREEN}Student account created successfully.{Style.RESET_ALL}")
        print(f"ID: {id_number}")
        print(f"Name: {name}")
        print(f"One-time password: {otp}")
        print("The student will be prompted to change this password on first login.")
        
        return True
    
    def list_students(self):
        """List all students"""
        if not self.current_user:
            print(f"{Fore.RED}You must be logged in to list students.{Style.RESET_ALL}")
            return False
        
        if not self.students:
            print(f"{Fore.YELLOW}No students registered yet.{Style.RESET_ALL}")
            return True
        
        print(f"\n{Fore.CYAN}===== REGISTERED STUDENTS ====={Style.RESET_ALL}")
        
        for i, student in enumerate(self.students, 1):
            print(f"{i}. ID: {student['id']}")
            print(f"   Name: {student['name']}")
            print(f"   Department: {student['department']}")
            print(f"   Email: {student['email']}")
            print(f"   Registration date: {student['registration_date']}")
            print(f"   Face images: {len(student.get('images', []))}")
            print(f"   Last login: {student.get('last_login', 'Never')}")
            print()
        
        return True
    
    def view_attendance(self):
        """View attendance records"""
        if not self.current_user:
            print(f"{Fore.RED}You must be logged in to view attendance records.{Style.RESET_ALL}")
            return False
        
        # Check if attendance file exists
        attendance_file = f"attendance_{datetime.now().strftime('%Y-%m-%d')}.json"
        
        if not os.path.exists(attendance_file):
            print(f"{Fore.YELLOW}No attendance records found for today.{Style.RESET_ALL}")
            
            # Ask if they want to view a different date
            view_other = input("Would you like to specify a different date? (y/n): ").lower()
            if view_other == 'y':
                date = input("Enter date (YYYY-MM-DD): ")
                attendance_file = f"attendance_{date}.json"
                if not os.path.exists(attendance_file):
                    print(f"{Fore.RED}No attendance records found for {date}.{Style.RESET_ALL}")
                    return False
            else:
                return False
        
        # Load attendance records
        try:
            with open(attendance_file, 'r') as f:
                attendance = json.load(f)
        except:
            print(f"{Fore.RED}Error loading attendance records.{Style.RESET_ALL}")
            return False
        
        print(f"\n{Fore.CYAN}===== ATTENDANCE RECORDS ({os.path.basename(attendance_file)}) ====={Style.RESET_ALL}")
        
        # Map student IDs to names
        id_to_name = {s["id"]: s["name"] for s in self.students}
        
        for student_id, record in attendance.items():
            # Try to get student name (if ID is in our database)
            student_name = id_to_name.get(student_id, f"Unknown ({student_id})")
            
            print(f"Student: {student_name}")
            print(f"First seen: {record['first_seen']}")
            print(f"Last seen: {record['last_seen']}")
            print(f"Total appearances: {record['total_appearances']}")
            print()
        
        return True
    
    def reset_student_password(self):
        """Reset a student's password"""
        if not self.current_user:
            print(f"{Fore.RED}You must be logged in to reset student passwords.{Style.RESET_ALL}")
            return False
        
        print(f"\n{Fore.CYAN}===== RESET STUDENT PASSWORD ====={Style.RESET_ALL}")
        
        # List students briefly
        print("Student IDs:")
        for student in self.students:
            print(f"  {student['id']} - {student['name']}")
        
        # Get student ID
        student_id = input("\nEnter student ID to reset password: ")
        
        # Find student
        student = next((s for s in self.students if s["id"] == student_id), None)
        
        if not student:
            print(f"{Fore.RED}Student not found.{Style.RESET_ALL}")
            return False
        
        # Generate new password
        new_password = self._generate_otp()
        
        # Update student password
        student["password_hash"] = self._hash_password(new_password)
        student["must_change_password"] = True
        self._save_students()
        
        print(f"\n{Fore.GREEN}Password reset successful for {student['name']}.{Style.RESET_ALL}")
        print(f"New temporary password: {new_password}")
        print("The student will be prompted to change this password on next login.")
        
        return True
    
    def run(self):
        """Run the admin panel"""
        # Login
        if not self.login():
            return
        
        while True:
            print(f"\n{Fore.CYAN}===== ADMIN PANEL ====={Style.RESET_ALL}")
            print(f"Logged in as: {self.current_user['username']} ({self.current_user['role']})")
            print("\nOptions:")
            print("1. Create student account")
            print("2. List students")
            print("3. View attendance records")
            print("4. Reset student password")
            print("5. Change your password")
            
            # Only show admin management for superadmins
            if self.current_user["role"] == "superadmin":
                print("6. Create admin user")
                print("7. List admin users")
            
            print("0. Logout")
            
            choice = input("\nEnter choice: ")
            
            if choice == "1":
                self.create_student()
            elif choice == "2":
                self.list_students()
            elif choice == "3":
                self.view_attendance()
            elif choice == "4":
                self.reset_student_password()
            elif choice == "5":
                self.change_password()
            elif choice == "6" and self.current_user["role"] == "superadmin":
                self.create_admin()
            elif choice == "7" and self.current_user["role"] == "superadmin":
                self.list_admins()
            elif choice == "0":
                print(f"\n{Fore.GREEN}Logged out successfully.{Style.RESET_ALL}")
                break
            else:
                print(f"{Fore.RED}Invalid choice.{Style.RESET_ALL}")
            
            input("\nPress Enter to continue...")

def main():
    """Run the admin panel"""
    parser = argparse.ArgumentParser(description='Admin Panel for Ethiopian Student Attendance System')
    parser.add_argument('--users-file', default='admin_users.json',
                        help='Path to admin users JSON file')
    parser.add_argument('--students-file', default='students_data.json',
                        help='Path to students data JSON file')
    
    args = parser.parse_args()
    
    admin_panel = AdminPanel(args.users_file, args.students_file)
    admin_panel.run()

if __name__ == "__main__":
    main() 