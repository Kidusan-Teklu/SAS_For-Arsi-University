import os
import cv2
import time
import numpy as np
from datetime import datetime
import face_recognition
from recognition.face_utils import FaceRecognizer
import argparse
import json

class FaceAttendanceDemo:
    def __init__(self, known_faces_dir):
        """Initialize the face attendance demo with a directory of known faces."""
        self.known_faces_dir = known_faces_dir
        self.recognizer = FaceRecognizer()
        
        # Load known faces
        self.known_face_encodings = []
        self.known_face_names = []
        self.load_known_faces()
        
        # Initialize attendance record
        self.attendance_record = {}
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        
    def load_known_faces(self):
        """Load all known faces from the directory."""
        print(f"Loading known faces from {self.known_faces_dir}...")
        
        for filename in os.listdir(self.known_faces_dir):
            if filename.endswith(".jpg") or filename.endswith(".png") or filename.endswith(".jpeg"):
                # Extract name from filename (assuming format: person_name.jpg)
                name = os.path.splitext(filename)[0]
                
                # Load image
                image_path = os.path.join(self.known_faces_dir, filename)
                image = cv2.imread(image_path)
                
                if image is None:
                    print(f"Could not load image: {image_path}")
                    continue
                
                # Extract face encoding
                encoding, error = self.recognizer.extract_face_encodings(image)
                
                if error:
                    print(f"Error processing {filename}: {error}")
                    continue
                
                # Add to known faces
                self.known_face_encodings.append(encoding)
                self.known_face_names.append(name)
                print(f"Loaded face for: {name}")
        
        print(f"Loaded {len(self.known_face_encodings)} known faces")
    
    def mark_attendance(self, name):
        """Mark attendance for a recognized person."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        if name not in self.attendance_record:
            self.attendance_record[name] = {
                "first_seen": timestamp,
                "last_seen": timestamp,
                "total_appearances": 1
            }
        else:
            self.attendance_record[name]["last_seen"] = timestamp
            self.attendance_record[name]["total_appearances"] += 1
        
        print(f"✓ Attendance marked for {name} at {timestamp}")
    
    def save_attendance_record(self, output_file=None):
        """Save the attendance record to a file."""
        if output_file is None:
            output_file = f"attendance_{self.current_date}.json"
        
        with open(output_file, 'w') as f:
            json.dump(self.attendance_record, f, indent=4)
        
        print(f"Attendance record saved to {output_file}")
    
    def run_webcam_attendance(self):
        """Run real-time attendance marking using webcam with DirectShow backend."""
        print("Starting webcam attendance system with DirectShow backend...")
        print("Press 'q' to quit, 's' to save attendance record")
        
        # Initialize webcam with DirectShow
        try:
            # Try to use DirectShow backend which often works better on Windows
            cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
            
            if not cap.isOpened():
                print("Error: Could not open webcam with DirectShow")
                return
            
            # Set properties for better performance
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            
            # Get camera properties
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            
            print(f"Camera properties: {width}x{height} at {fps} FPS")
            
            # Set variables for attendance logic
            recognition_interval = 5  # seconds between attendance markings
            last_recognition_time = {}  # track last recognition time for each person
            
            # For FPS calculation
            frame_count = 0
            start_time = time.time()
            
            while True:
                # Capture frame-by-frame
                ret, frame = cap.read()
                
                if not ret:
                    print("Error: Failed to capture frame")
                    # Try one more time before giving up
                    time.sleep(0.1)
                    ret, frame = cap.read()
                    if not ret:
                        break
                
                # Calculate FPS
                frame_count += 1
                elapsed_time = time.time() - start_time
                if elapsed_time >= 1.0:
                    actual_fps = frame_count / elapsed_time
                    print(f"Processing at {actual_fps:.2f} FPS")
                    frame_count = 0
                    start_time = time.time()
                
                # Resize frame for faster face detection
                small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
                
                # Convert the image to RGB (face_recognition uses RGB)
                rgb_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
                
                # Find face locations and encodings
                face_locations = face_recognition.face_locations(rgb_frame, model=self.recognizer.model)
                
                if face_locations:
                    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
                    
                    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
                        # Scale back up face locations since the frame we detected in was scaled to 1/4 size
                        top *= 4
                        right *= 4
                        bottom *= 4
                        left *= 4
                        
                        # Try to recognize the face
                        best_match = False
                        best_match_name = "Unknown"
                        highest_confidence = 0
                        
                        for i, known_encoding in enumerate(self.known_face_encodings):
                            match, confidence = self.recognizer.compare_faces(known_encoding, face_encoding)
                            
                            if match and confidence > highest_confidence:
                                best_match = True
                                highest_confidence = confidence
                                best_match_name = self.known_face_names[i]
                        
                        # Determine the display color (green for recognized, red for unknown)
                        display_color = (0, 255, 0) if best_match else (0, 0, 255)
                        
                        # Draw a box around the face
                        cv2.rectangle(frame, (left, top), (right, bottom), display_color, 2)
                        
                        # Draw a label with the name below the face
                        label_text = f"{best_match_name} ({highest_confidence:.2f}%)"
                        cv2.rectangle(frame, (left, bottom - 35), (right, bottom), display_color, cv2.FILLED)
                        cv2.putText(frame, label_text, (left + 6, bottom - 6), 
                                    cv2.FONT_HERSHEY_DUPLEX, 0.6, (255, 255, 255), 1)
                        
                        # Mark attendance if recognized and not marked recently
                        now = time.time()
                        if best_match and (best_match_name not in last_recognition_time or 
                                          now - last_recognition_time[best_match_name] > recognition_interval):
                            self.mark_attendance(best_match_name)
                            last_recognition_time[best_match_name] = now
                
                # Display the resulting frame with date and time
                current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cv2.putText(frame, current_time, (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                
                # Display count of recognized people
                attendance_count = len(self.attendance_record)
                cv2.putText(frame, f"Attendance Count: {attendance_count}", (10, frame.shape[0] - 20), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                
                # Display controls info
                cv2.putText(frame, "Press 'q' to quit, 's' to save", (width - 250, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                
                cv2.imshow('Attendance System', frame)
                
                # Process key presses
                key = cv2.waitKey(1) & 0xFF
                
                # 'q' to quit
                if key == ord('q'):
                    break
                    
                # 's' to save attendance record
                elif key == ord('s'):
                    self.save_attendance_record()
            
            # Release the webcam and close all windows
            cap.release()
            cv2.destroyAllWindows()
            
            # Save attendance record when done
            self.save_attendance_record()
            print("Attendance session completed!")
            
        except Exception as e:
            print(f"Error: {str(e)}")
            # Save whatever attendance data we collected
            self.save_attendance_record()

def main():
    parser = argparse.ArgumentParser(description='Face Recognition Attendance Demo with DirectShow')
    parser.add_argument('--known_dir', default='test_images/known',
                        help='Directory containing known face images')
    parser.add_argument('--output', default=None,
                        help='Output file for attendance record (default: attendance_YYYY-MM-DD.json)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.known_dir):
        print(f"Error: Known faces directory {args.known_dir} does not exist")
        print("Creating a test directory structure first...")
        # Try to create the test directory structure
        import create_test_images_dir
        create_test_images_dir.create_test_directory()
        
        if not os.path.exists(args.known_dir):
            print(f"Please add face images to {args.known_dir} before running this script")
            return
    
    # Count images in the known directory
    image_count = len([f for f in os.listdir(args.known_dir) if f.endswith(('.jpg', '.png', '.jpeg'))])
    
    if image_count == 0:
        print(f"No images found in {args.known_dir}")
        print("Please add some face images before running this script")
        return
    
    # Run the attendance demo
    attendance_demo = FaceAttendanceDemo(args.known_dir)
    attendance_demo.run_webcam_attendance()
    
    # Save the attendance record
    if args.output:
        attendance_demo.save_attendance_record(args.output)

if __name__ == "__main__":
    main() 