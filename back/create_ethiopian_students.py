import os
import shutil
import uuid
import json
import cv2
import time
import argparse
import face_recognition
from datetime import datetime
from recognition.face_utils import FaceRecognizer

class StudentRegistration:
    def __init__(self, known_faces_dir='test_images/known'):
        """Initialize student registration system"""
        self.known_faces_dir = known_faces_dir
        self.recognizer = FaceRecognizer()
        self.students = []
        
        # Create known faces directory if it doesn't exist
        if not os.path.exists(self.known_faces_dir):
            os.makedirs(self.known_faces_dir)
            print(f"Created directory: {self.known_faces_dir}")
    
    def add_student(self, name, id_number, department, email):
        """Add a new student to the system"""
        student = {
            "id": id_number,
            "name": name,
            "department": department,
            "email": email,
            "registration_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "images": []
        }
        
        self.students.append(student)
        print(f"Added student: {name} (ID: {id_number})")
        return student
    
    def capture_webcam_image(self, student, use_directshow=True):
        """Capture a webcam image for a student"""
        print(f"\nCapturing webcam image for {student['name']} (ID: {student['id']})")
        print("Position your face clearly in the webcam")
        print("Press 'c' to capture, 'r' to retry, 'q' to quit")
        
        # Initialize webcam with DirectShow on Windows
        if use_directshow:
            cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        else:
            cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Error: Could not open webcam")
            return None
        
        # Set properties for better quality
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        captured_image = None
        face_detected = False
        
        while True:
            # Capture frame-by-frame
            ret, frame = cap.read()
            
            if not ret:
                print("Error: Failed to capture frame")
                break
            
            # Create a copy of the frame for face detection display
            display_frame = frame.copy()
            
            # Display instructions
            cv2.putText(
                display_frame, f"Student: {student['name']}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2
            )
            
            cv2.putText(
                display_frame, "Press 'c' to capture, 'r' to retry, 'q' to quit", (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1
            )
            
            # Check for face in the frame
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame, model=self.recognizer.model)
            
            if face_locations:
                face_detected = True
                # Draw rectangle around the face
                for (top, right, bottom, left) in face_locations:
                    cv2.rectangle(display_frame, (left, top), (right, bottom), (0, 255, 0), 2)
                    cv2.putText(
                        display_frame, "Face Detected", (left, top - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1
                    )
            else:
                face_detected = False
                cv2.putText(
                    display_frame, "No face detected", (10, 90),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2
                )
            
            # Display the frame
            cv2.imshow(f'Capture Image for {student["name"]}', display_frame)
            
            # Process key presses
            key = cv2.waitKey(1) & 0xFF
            
            # 'c' to capture
            if key == ord('c'):
                if face_detected:
                    captured_image = frame.copy()
                    print("Image captured successfully!")
                    break
                else:
                    print("Cannot capture - No face detected. Please position your face clearly.")
            
            # 'r' to retry
            elif key == ord('r'):
                print("Retrying...")
                continue
            
            # 'q' to quit
            elif key == ord('q'):
                print("Capture cancelled.")
                break
        
        # Release webcam and close windows
        cap.release()
        cv2.destroyAllWindows()
        
        return captured_image
    
    def save_student_image(self, student, image):
        """Save a captured image for a student"""
        if image is None:
            print("No image to save.")
            return None
        
        # Create filename based on student ID
        image_filename = f"{student['id']}.jpg"
        image_path = os.path.join(self.known_faces_dir, image_filename)
        
        # Save the image
        cv2.imwrite(image_path, image)
        print(f"Image saved to: {image_path}")
        
        # Extract face encoding and verify it's a valid face image
        encoding, error = self.recognizer.extract_face_encodings(image)
        
        if error:
            print(f"Warning: {error}")
            print("The image was saved but might not work well for face recognition.")
            return image_path
        
        print("Face detected and encoded successfully!")
        student['images'].append({
            "path": image_path,
            "capture_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "has_valid_face": True
        })
        
        return image_path
    
    def import_existing_image(self, student, image_path):
        """Import an existing image for a student"""
        if not os.path.exists(image_path):
            print(f"Error: Image file not found: {image_path}")
            return None
        
        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            print(f"Error: Could not read image: {image_path}")
            return None
        
        # Create new filename based on student ID
        ext = os.path.splitext(image_path)[1]
        new_filename = f"{student['id']}{ext}"
        new_path = os.path.join(self.known_faces_dir, new_filename)
        
        # Copy the image
        shutil.copy2(image_path, new_path)
        print(f"Image imported to: {new_path}")
        
        # Extract face encoding and verify it's a valid face image
        encoding, error = self.recognizer.extract_face_encodings(image)
        
        if error:
            print(f"Warning: {error}")
            print("The image was imported but might not work well for face recognition.")
            return new_path
        
        print("Face detected and encoded successfully!")
        student['images'].append({
            "path": new_path,
            "capture_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "has_valid_face": True
        })
        
        return new_path
    
    def save_students_data(self, output_file='students_data.json'):
        """Save the students data to a JSON file"""
        with open(output_file, 'w') as f:
            json.dump(self.students, f, indent=4)
        
        print(f"\nStudents data saved to: {output_file}")
        print(f"Total students registered: {len(self.students)}")
        print(f"Face images directory: {self.known_faces_dir}")

def create_ethiopian_students():
    """Create and register 4 Ethiopian students"""
    parser = argparse.ArgumentParser(description='Register Ethiopian Students with Face Images')
    parser.add_argument('--use-directshow', action='store_true', default=True,
                      help='Use DirectShow backend for webcam capture (recommended on Windows)')
    
    args = parser.parse_args()
    
    # Ethiopian names for our demo
    students_data = [
        {
            "name": "Abebe Bikila",
            "id": "ETH001",
            "department": "Computer Science",
            "email": "abebe.bikila@example.com"
        },
        {
            "name": "Tsedale Lemma",
            "id": "ETH002",
            "department": "Electrical Engineering",
            "email": "tsedale.lemma@example.com"
        },
        {
            "name": "Haile Gebrselassie",
            "id": "ETH003",
            "department": "Mechanical Engineering",
            "email": "haile.gebrselassie@example.com"
        },
        {
            "name": "Bethlehem Tilahun",
            "id": "ETH004",
            "department": "Information Technology",
            "email": "bethlehem.tilahun@example.com"
        }
    ]
    
    # Initialize registration system
    registration = StudentRegistration()
    
    # Register each student and capture their image
    for student_data in students_data:
        print("\n" + "="*50)
        print(f"Registering student: {student_data['name']}")
        
        # Add student to the system
        student = registration.add_student(
            student_data["name"],
            student_data["id"],
            student_data["department"],
            student_data["email"]
        )
        
        # Ask whether to use webcam or skip
        while True:
            choice = input("\nCapture webcam image for this student? (y/n): ").lower()
            if choice == 'y':
                # Capture and save webcam image
                image = registration.capture_webcam_image(student, use_directshow=args.use_directshow)
                if image is not None:
                    registration.save_student_image(student, image)
                break
            elif choice == 'n':
                print("Skipping webcam capture for this student.")
                break
            else:
                print("Please enter 'y' or 'n'.")
        
        # Ask whether to import an existing image
        while True:
            choice = input("\nImport an existing image for this student? (y/n): ").lower()
            if choice == 'y':
                image_path = input("Enter the path to the image file: ")
                registration.import_existing_image(student, image_path)
                break
            elif choice == 'n':
                print("Skipping image import for this student.")
                break
            else:
                print("Please enter 'y' or 'n'.")
    
    # Save all student data
    registration.save_students_data()
    print("\nAll students registered successfully!")

if __name__ == "__main__":
    create_ethiopian_students() 