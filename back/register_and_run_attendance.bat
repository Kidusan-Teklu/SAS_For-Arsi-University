@echo off
SETLOCAL EnableDelayedExpansion

:: Activate virtual environment
call venv\Scripts\activate.bat

echo ================================================
echo Ethiopian Student Attendance Management System
echo ================================================
echo.
echo Choose an option:
echo 1. Register new Ethiopian students
echo 2. Run attendance system with registered students
echo 3. Exit
echo.

set /p CHOICE=Enter your choice (1-3): 

if "%CHOICE%"=="1" (
    echo.
    echo Running student registration system...
    echo.
    python create_ethiopian_students.py
    
    echo.
    echo Registration completed. Would you like to run the attendance system now?
    set /p RUN_ATTENDANCE=Enter (y/n): 
    
    if /i "!RUN_ATTENDANCE!"=="y" (
        echo.
        echo Running attendance system...
        echo.
        python run_student_attendance.py
    )
) else if "%CHOICE%"=="2" (
    echo.
    echo Running attendance system with registered students...
    echo.
    python run_student_attendance.py
) else if "%CHOICE%"=="3" (
    echo Exiting...
    exit /b 0
) else (
    echo Invalid choice. Please enter a number between 1 and 3.
    exit /b 1
)

echo.
echo Process completed.
echo.
pause

ENDLOCAL 