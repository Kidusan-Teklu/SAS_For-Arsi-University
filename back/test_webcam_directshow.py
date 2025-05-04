import cv2
import time

def test_webcam_directshow():
    """Test webcam access using DirectShow backend on Windows"""
    print("Testing webcam with DirectShow backend")
    print("Press 'q' to quit")
    
    # Try to use DirectShow (dshow) backend on Windows
    # The magic string format is: "video=Camera Name"
    # We'll first try to list available cameras
    
    try:
        # List available camera devices
        index = 0
        devices = []
        while True:
            cap = cv2.VideoCapture(index, cv2.CAP_DSHOW)
            if not cap.isOpened():
                break
            ret, _ = cap.read()  # Test if we can read a frame
            if ret:
                name = f"Camera {index}"
                print(f"Found camera device: {name}")
                devices.append(index)
            cap.release()
            index += 1
        
        if not devices:
            print("No camera devices found!")
            return False
        
        print(f"Found {len(devices)} camera device(s)")
        print("Attempting to open the first available camera...")
        
        # Open the first available camera with DirectShow
        cap = cv2.VideoCapture(devices[0], cv2.CAP_DSHOW)
        
        if not cap.isOpened():
            print("Error: Could not open camera with DirectShow")
            return False
            
        # Get camera properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        print(f"Camera properties: {width}x{height} at {fps} FPS")
        
        # Set smaller resolution if supported (might help with performance)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        # Display webcam feed
        start_time = time.time()
        frame_count = 0
        
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
            
            frame_count += 1
            elapsed_time = time.time() - start_time
            if elapsed_time >= 1.0:
                actual_fps = frame_count / elapsed_time
                print(f"Actual FPS: {actual_fps:.2f}")
                frame_count = 0
                start_time = time.time()
            
            # Add FPS text to the frame
            cv2.putText(frame, f"Press 'q' to quit", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            # Display the resulting frame
            cv2.imshow('DirectShow Webcam Test', frame)
            
            # Process key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
        
        # Release the webcam and close windows
        cap.release()
        cv2.destroyAllWindows()
        return True
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    test_webcam_directshow() 