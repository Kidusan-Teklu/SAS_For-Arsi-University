import os
import json
import argparse
from face_attendance_demo_directshow import FaceAttendanceDemo

def main():
    """Run the attendance system with registered Ethiopian students"""
    parser = argparse.ArgumentParser(description='Run Attendance System for Registered Students')
    parser.add_argument('--students-data', default='students_data.json',
                        help='Path to the students data JSON file')
    parser.add_argument('--output', default=None,
                        help='Output file for attendance record (default: attendance_YYYY-MM-DD.json)')
    
    args = parser.parse_args()
    
    # Check if students data file exists
    if not os.path.exists(args.students_data):
        print(f"Error: Students data file not found: {args.students_data}")
        print("Please register students first using create_ethiopian_students.py")
        return
    
    # Load students data
    try:
        with open(args.students_data, 'r') as f:
            students_data = json.load(f)
        
        print(f"Loaded {len(students_data)} students from {args.students_data}")
    except Exception as e:
        print(f"Error loading students data: {str(e)}")
        return
    
    # Get the known faces directory from the first student's image path
    known_faces_dir = 'test_images/known'  # Default
    if students_data and len(students_data) > 0:
        if 'images' in students_data[0] and len(students_data[0]['images']) > 0:
            image_path = students_data[0]['images'][0]['path']
            known_faces_dir = os.path.dirname(image_path)
    
    print(f"Using faces directory: {known_faces_dir}")
    
    # Display registered students
    print("\nRegistered Students:")
    print("--------------------")
    for student in students_data:
        image_count = len(student.get('images', []))
        print(f"ID: {student['id']}, Name: {student['name']}, Images: {image_count}")
    
    print("\nStarting attendance system...")
    
    # Initialize and run the attendance demo
    attendance_demo = FaceAttendanceDemo(known_faces_dir)
    attendance_demo.run_webcam_attendance()
    
    # Save the attendance record if specified
    if args.output:
        attendance_demo.save_attendance_record(args.output)
    
    print("\nAttendance session completed!")

if __name__ == "__main__":
    main() 