@echo off
echo Компиляция SCSS в CSS...
echo.

REM Проверяем наличие Sass
where sass >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Sass не установлен!
    echo.
    echo Установите Sass одним из способов:
    echo 1. npm install -g sass
    echo 2. Или используйте VS Code расширение "Live Sass Compiler"
    echo.
    pause
    exit /b 1
)

REM Компилируем SCSS
sass scss/style.scss css/style.min.css --style compressed

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Компиляция успешна!
    echo CSS файл обновлен: css/style.min.css
) else (
    echo.
    echo ✗ Ошибка компиляции!
)

echo.
pause

