import cv2
import sys

def test_webcam(camera_index=0):
    """Simple test to verify webcam access"""
    print(f"Testing webcam with camera index: {camera_index}")
    print("Press 'q' to quit, 'c' to try different camera index")
    
    # Initialize webcam
    cap = cv2.VideoCapture(camera_index)
    
    if not cap.isOpened():
        print(f"Error: Could not open webcam with index {camera_index}")
        return False
    
    # Get webcam properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    print(f"Webcam properties: {width}x{height} at {fps} FPS")
    
    # Display webcam feed
    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()
        
        if not ret:
            print("Error: Failed to capture frame")
            break
        
        # Display the resulting frame
        cv2.imshow('Webcam Test', frame)
        
        # Process key presses
        key = cv2.waitKey(1) & 0xFF
        
        # 'q' to quit
        if key == ord('q'):
            break
            
        # 'c' to try different camera
        elif key == ord('c'):
            new_index = (camera_index + 1) % 3  # Try indices 0, 1, 2
            cap.release()
            cv2.destroyAllWindows()
            return test_webcam(new_index)
    
    # Release the webcam and close windows
    cap.release()
    cv2.destroyAllWindows()
    return True

if __name__ == "__main__":
    # Get camera index from command line if provided
    camera_index = 0
    if len(sys.argv) > 1:
        try:
            camera_index = int(sys.argv[1])
        except ValueError:
            print("Error: Camera index must be an integer")
            sys.exit(1)
    
    test_webcam(camera_index) 