@echo off
cls
set BASE_DIR=%~dp0
rem mongo/bin must be in path
setlocal
set server=%1%
if "%server%" == "" (
    set server=localhost
)
set database=%2%
if "%database%" == "" (
    set database=jdoe
)

@echo Loading users...
mongoimport -h %server% --port 27017 -d scratchminder -c users --drop --jsonArray --stopOnError --file "%BASE_DIR%\..\tests\seed\users.json"

@echo Loading tokens...
mongoimport -h %server% --port 27017 -d scratchminder -c tokens --drop --jsonArray --stopOnError --file "%BASE_DIR%\..\tests\seed\tokens.json"

@echo Loading accounts...
mongoimport -h %server% --port 27017 -d %database% -c accounts --drop --jsonArray --stopOnError --file "%BASE_DIR%\..\tests\seed\accounts.json"

@echo Loading transactions...
mongoimport -h %server% --port 27017 -d %database% -c transactions --drop --jsonArray --stopOnError --file "%BASE_DIR%\..\tests\seed\transactions.json"


rem pause
endlocal
