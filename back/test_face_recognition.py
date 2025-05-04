import os
import sys
import cv2
import numpy as np
import argparse
from recognition.face_utils import FaceRecognizer

def test_face_detection(image_path):
    """Test face detection on a single image"""
    print(f"Testing face detection on: {image_path}")
    
    # Initialize face recognizer
    recognizer = FaceRecognizer()
    
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Could not load image from {image_path}")
        return False
    
    # Detect face
    encoding, error = recognizer.extract_face_encodings(image)
    
    if error:
        print(f"Error: {error}")
        return False
    
    print("Face detected successfully!")
    print(f"Encoding shape: {encoding.shape}")
    
    # Draw face locations on the image for visualization
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_image, model=recognizer.model)
    
    # Make a copy of the image to draw on
    display_image = image.copy()
    
    # Draw rectangles around the faces
    for (top, right, bottom, left) in face_locations:
        cv2.rectangle(display_image, (left, top), (right, bottom), (0, 255, 0), 2)
    
    # Display the image with faces highlighted
    # Resize for display if too large
    height, width = display_image.shape[:2]
    max_display_height = 600
    if height > max_display_height:
        scale = max_display_height / height
        display_image = cv2.resize(display_image, (int(width * scale), max_display_height))
    
    cv2.imshow("Detected Face", display_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    
    return True

def test_face_comparison(image_path1, image_path2):
    """Test face comparison between two images"""
    print(f"Comparing faces in:\n1: {image_path1}\n2: {image_path2}")
    
    # Initialize face recognizer
    recognizer = FaceRecognizer()
    
    # Load first image
    image1 = cv2.imread(image_path1)
    if image1 is None:
        print(f"Error: Could not load image from {image_path1}")
        return
    
    # Load second image
    image2 = cv2.imread(image_path2)
    if image2 is None:
        print(f"Error: Could not load image from {image_path2}")
        return
    
    # Get face encodings
    encoding1, error1 = recognizer.extract_face_encodings(image1)
    if error1:
        print(f"Error in first image: {error1}")
        return
    
    encoding2, error2 = recognizer.extract_face_encodings(image2)
    if error2:
        print(f"Error in second image: {error2}")
        return
    
    # Compare faces
    match, confidence = recognizer.compare_faces(encoding1, encoding2)
    
    # Display result
    print(f"Match: {match}")
    print(f"Confidence: {confidence:.2f}%")
    
    # Display images side by side with comparison result
    # Resize images to the same height for display
    height1, width1 = image1.shape[:2]
    height2, width2 = image2.shape[:2]
    
    target_height = 300
    scale1 = target_height / height1
    scale2 = target_height / height2
    
    display_img1 = cv2.resize(image1, (int(width1 * scale1), target_height))
    display_img2 = cv2.resize(image2, (int(width2 * scale2), target_height))
    
    # Create a combined image
    combined_width = display_img1.shape[1] + display_img2.shape[1]
    combined_img = np.zeros((target_height, combined_width, 3), dtype=np.uint8)
    
    # Copy the resized images into the combined image
    combined_img[:, :display_img1.shape[1]] = display_img1
    combined_img[:, display_img1.shape[1]:] = display_img2
    
    # Add text with match result
    match_text = f"Match: {match}, Confidence: {confidence:.2f}%"
    
    # Set text color based on match
    text_color = (0, 255, 0) if match else (0, 0, 255)  # Green if match, Red if not
    
    cv2.putText(
        combined_img, match_text, (10, 30),
        cv2.FONT_HERSHEY_SIMPLEX, 0.7, text_color, 2
    )
    
    # Display the combined image
    cv2.imshow("Face Comparison", combined_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def test_webcam_face_detection():
    """Test real-time face detection using webcam"""
    print("Starting webcam face detection test...")
    print("Press 'q' to quit")
    
    # Initialize face recognizer
    recognizer = FaceRecognizer()
    
    # Initialize webcam
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam")
        return
    
    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()
        
        if not ret:
            print("Error: Failed to capture frame")
            break
        
        # Convert the image to RGB (face_recognition uses RGB)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Find all face locations in the current frame
        face_locations = face_recognition.face_locations(rgb_frame, model=recognizer.model)
        
        # Draw rectangles around the faces
        for (top, right, bottom, left) in face_locations:
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            
            # Add text indicating a face is detected
            cv2.putText(
                frame, "Face Detected", (left, top - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2
            )
        
        # Display the number of faces detected
        cv2.putText(
            frame, f"Faces: {len(face_locations)}", (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 165, 255), 2
        )
        
        # Display the resulting frame
        cv2.imshow('Webcam Face Detection', frame)
        
        # Break the loop on 'q' key press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Release the webcam and close all windows
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    # Import here to avoid import errors when the module is imported
    import face_recognition
    
    parser = argparse.ArgumentParser(description='Test face recognition functionality')
    parser.add_argument('--test', choices=['detect', 'compare', 'webcam'], required=True,
                        help='Test to run: detect (single image), compare (two images), or webcam')
    parser.add_argument('--image1', help='Path to the first image')
    parser.add_argument('--image2', help='Path to the second image (for comparison)')
    
    args = parser.parse_args()
    
    if args.test == 'detect':
        if not args.image1:
            print("Error: --image1 is required for detection test")
            sys.exit(1)
        test_face_detection(args.image1)
    
    elif args.test == 'compare':
        if not args.image1 or not args.image2:
            print("Error: --image1 and --image2 are required for comparison test")
            sys.exit(1)
        test_face_comparison(args.image1, args.image2)
    
    elif args.test == 'webcam':
        test_webcam_face_detection() 