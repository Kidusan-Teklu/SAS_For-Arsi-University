# Face Recognition Testing Guide

This guide explains how to use the `test_face_recognition.py` script to test the face recognition functionality in the Smart Attendance System.

## Prerequisites

Make sure you have installed all the required dependencies:

```bash
# Activate the virtual environment
cd back
venv\scripts\activate

# Install the required packages
pip install dlib
pip install face-recognition
pip install opencv-python
pip install numpy
pip install Pillow
```

## Testing Options

The test script provides three testing options:

1. **Face Detection Test**: Test face detection on a single image
2. **Face Comparison Test**: Compare faces in two different images
3. **Webcam Face Detection Test**: Test real-time face detection using your webcam

## Using the Test Script

### 1. Testing Face Detection

To test face detection on a single image:

```bash
python test_face_recognition.py --test detect --image1 /path/to/your/image.jpg
```

This will:
- Load the specified image
- Detect faces in the image
- Display the image with rectangles around detected faces
- Print information about the detected face

### 2. Testing Face Comparison

To compare faces in two different images:

```bash
python test_face_recognition.py --test compare --image1 /path/to/first/image.jpg --image2 /path/to/second/image.jpg
```

This will:
- Load both images
- Detect and extract face encodings from both images
- Compare the faces and calculate a confidence score
- Display both images side by side with the comparison result

### 3. Testing Webcam Face Detection

To test real-time face detection using your webcam:

```bash
python test_face_recognition.py --test webcam
```

This will:
- Open your webcam
- Detect faces in real-time
- Display the webcam feed with rectangles around detected faces
- Press 'q' to quit the test

## Sample Images

For testing, you can use your own images or download sample face images from:
- [Yale Face Database](http://vision.ucsd.edu/content/yale-face-database)
- [LFW Face Database](http://vis-www.cs.umass.edu/lfw/)

## Troubleshooting

### No Face Detected
- Make sure the face is clearly visible and well-lit
- Try a different image with a more frontal face pose
- Check if the lighting conditions are good

### Face Detection Works But Comparison Fails
- Make sure both images contain clear, frontal face views
- Check that the faces are properly aligned
- Try with higher quality images

### Webcam Test Issues
- Ensure your webcam is properly connected and working
- Check if your system has the proper permissions to access the webcam
- Try in a well-lit environment for better results

## Note on Using The Test Results

The confidence scores from this test can help you adjust the tolerance threshold in the `FaceRecognizer` class to balance between:
- Higher security (higher threshold, fewer false positives)
- Better user experience (lower threshold, fewer false negatives)

The default threshold is 0.6 (60% confidence), which provides a good balance for most use cases. 