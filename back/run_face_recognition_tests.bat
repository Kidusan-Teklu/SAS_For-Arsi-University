@echo off
SETLOCAL EnableDelayedExpansion

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Create the test directory structure if it doesn't exist
python create_test_images_dir.py

:: Check if test_images/known directory has any images
set KNOWN_IMAGES=0
for %%f in (test_images\known\*.jpg test_images\known\*.png test_images\known\*.jpeg) do (
    set /a KNOWN_IMAGES+=1
)

if %KNOWN_IMAGES% EQU 0 (
    echo No known face images found in test_images\known directory.
    echo Please add some reference images before running comparison tests.
    echo.
    echo You can still run the webcam test.
)

echo.
echo Face Recognition Test Menu
echo -------------------------
echo 1. Run Webcam Face Detection Test
echo 2. Run Face Detection Test on a Single Image
echo 3. Run Face Comparison Test Between Two Images
echo 4. Exit
echo.

set /p CHOICE=Enter your choice (1-4): 

if "%CHOICE%"=="1" (
    echo Running webcam face detection test...
    python test_face_recognition.py --test webcam
) else if "%CHOICE%"=="2" (
    set /p IMAGE_PATH=Enter path to the image file: 
    echo Running face detection test on %IMAGE_PATH%...
    python test_face_recognition.py --test detect --image1 "%IMAGE_PATH%"
) else if "%CHOICE%"=="3" (
    set /p IMAGE1_PATH=Enter path to the first image file: 
    set /p IMAGE2_PATH=Enter path to the second image file: 
    echo Running face comparison test between %IMAGE1_PATH% and %IMAGE2_PATH%...
    python test_face_recognition.py --test compare --image1 "%IMAGE1_PATH%" --image2 "%IMAGE2_PATH%"
) else if "%CHOICE%"=="4" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice. Please enter a number between 1 and 4.
    exit /b 1
)

ENDLOCAL 