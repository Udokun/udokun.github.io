# Скрипт компиляции SCSS в CSS для PowerShell

Write-Host "Компиляция SCSS в CSS..." -ForegroundColor Cyan
Write-Host ""

# Проверяем наличие Sass
try {
    $sassVersion = sass --version 2>&1
    Write-Host "Найден Sass версии: $sassVersion" -ForegroundColor Green
} catch {
    Write-Host "Sass не установлен!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите Sass одним из способов:" -ForegroundColor Yellow
    Write-Host "1. npm install -g sass" -ForegroundColor White
    Write-Host "2. Или используйте VS Code расширение 'Live Sass Compiler'" -ForegroundColor White
    Write-Host ""
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

# Компилируем SCSS
Write-Host "Компилируем SCSS..." -ForegroundColor Yellow
sass scss/style.scss css/style.min.css --style compressed

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Компиляция успешна!" -ForegroundColor Green
    Write-Host "CSS файл обновлен: css/style.min.css" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✗ Ошибка компиляции!" -ForegroundColor Red
}

Write-Host ""
Read-Host "Нажмите Enter для выхода"

