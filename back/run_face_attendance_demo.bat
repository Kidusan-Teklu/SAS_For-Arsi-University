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
    echo Please add some reference images before running the attendance demo.
    echo.
    echo Add at least one image named after the person (e.g., john_doe.jpg) to the test_images\known directory.
    echo.
    set /p CONTINUE=Would you like to continue anyway? (Y/N): 
    
    if /i "!CONTINUE!" NEQ "Y" (
        echo Exiting...
        exit /b 0
    )
)

echo.
echo Running Face Attendance Demo...
echo.
echo Instructions:
echo - Press 'q' to quit the demo
echo - Press 's' to save the current attendance record
echo.
echo The system will automatically mark attendance when it recognizes a face.
echo Attendance records will be saved to a JSON file upon exit.
echo.
pause

:: Run the face attendance demo
python face_attendance_demo.py

echo.
echo Demo completed. Check the JSON file for attendance records.
echo.
pause

ENDLOCAL 