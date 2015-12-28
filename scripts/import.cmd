@echo off
cls
set BASE_DIR=%~dp0
rem mongo/bin must be in path
setlocal
set server=%1%
if "%server%" == "" (
    set server=localhost
)

@echo Loading users...
mongoimport -h %server% --port 27017 -d scratchminder -c users --drop --jsonArray --stopOnError --file "%BASE_DIR%\..\tests\seed\users.json"

@echo Loading tokens...
mongoimport -h %server% --port 27017 -d scratchminder -c tokens --drop --jsonArray --stopOnError --file "%BASE_DIR%\..\tests\seed\tokens.json"

rem pause
endlocal
