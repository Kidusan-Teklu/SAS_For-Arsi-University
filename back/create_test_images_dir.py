import os
import shutil
import sys

def create_test_directory():
    """Create a directory structure for test images."""
    # Define directory paths
    test_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_images')
    known_dir = os.path.join(test_dir, 'known')
    unknown_dir = os.path.join(test_dir, 'unknown')
    
    # Create directories if they don't exist
    for directory in [test_dir, known_dir, unknown_dir]:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Created directory: {directory}")
        else:
            print(f"Directory already exists: {directory}")
    
    # Create a README file in the test directory
    readme_path = os.path.join(test_dir, 'README.md')
    readme_content = """# Test Images Directory

This directory contains images for testing the face recognition system.

## Directory Structure

- `known/`: Place reference face images here. Ideally, multiple images of the same person.
- `unknown/`: Place test images here to compare against the known faces.

## Naming Convention

For known faces, use a naming convention like `person_name_01.jpg`, `person_name_02.jpg` etc.
This helps when identifying which reference image matched with a test image.

## Image Requirements

- Face should be clearly visible and well-lit
- Frontal face view works best
- Images should be reasonably sized (between 200px and 1000px in width/height)
- Common formats: .jpg, .png, .bmp
"""
    
    with open(readme_path, 'w') as f:
        f.write(readme_content)
    
    print(f"Created README file at: {readme_path}")
    print("\nDirectory structure created successfully!")
    print("\nNext steps:")
    print("1. Add reference face images to the 'known' directory")
    print("2. Add test images to the 'unknown' directory")
    print("3. Run face recognition tests with 'python test_face_recognition.py'")

if __name__ == "__main__":
    create_test_directory() 