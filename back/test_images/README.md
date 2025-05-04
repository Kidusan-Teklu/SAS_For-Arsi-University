# Test Images Directory

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
