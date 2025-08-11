@echo off
TITLE Betaflight Preset Updater (Node.js)

echo =======================================================
echo.
echo      Betaflight Preset Value Updater (Node.js)
echo.
echo =======================================================
echo.

REM Prompt the user to drag and drop the first file (preset)
set "PRESET_FILE="
set /p "PRESET_FILE=Drag and drop your PRESET file here and press Enter: "

REM Prompt for the second file (diff)
set "DIFF_FILE="
set /p "DIFF_FILE=Drag and drop your DIFF ALL file here and press Enter: "

echo.
echo -------------------------------------------------------
echo.

REM Remove quotes that Windows adds to paths with spaces
set PRESET_FILE=%PRESET_FILE:"=%
set DIFF_FILE=%DIFF_FILE:"=%

REM Execute the node script with the file paths as arguments
REM The quotes around the variables handle spaces in file paths correctly.
node updater.js "%PRESET_FILE%" "%DIFF_FILE%"

echo.
echo =======================================================
echo.
echo Script has finished. Check the folder for your updated file.
echo.
pause
