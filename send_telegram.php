<?php
// Простой autoloader для ручной загрузки (если понадобится)
// require_once 'vendor/phpoffice/phpword/src/PhpWord/Autoloader.php';

// Разрешаем CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Обработка preflight OPTIONS запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Включаем отображение ошибок для отладки
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Логируем входящие данные
$raw_data = file_get_contents('php://input');
error_log("Received data: " . $raw_data);

// Получаем данные из POST запроса
$data = json_decode($raw_data, true);

// Отладочная информация
error_log("Received data: " . print_r($data, true));

// Проверяем ошибки JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("JSON decode error: " . json_last_error_msg());
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data: ' . json_last_error_msg()]);
    exit;
}

// Проверяем наличие необходимых данных
if (!isset($data['name']) || !isset($data['phone'])) {
    error_log("Missing required fields. Data received: " . print_r($data, true));
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Определяем тип формы по наличию поля trip
$isBooking = isset($data['trip']) && !empty($data['trip']);

// Конфигурация бота
$TOKEN = '8321671119:AAFOAq0z1F3kxGXJjK28A0cfY9KOmW8XEzA';
$CHAT_ID = '-1002461676550';
$FEEDBACK_THREAD = '2202'; // Тред для обратной связи
$BOOKING_THREAD = '2387'; // Тред для бронирования

// Выбираем нужный тред
$MESSAGE_THREAD = $isBooking ? $BOOKING_THREAD : $FEEDBACK_THREAD;

// Формируем сообщение
$message = $isBooking ? "🎯 Новая заявка на бронирование:\n" : "💬 Новое сообщение с сайта:\n";
$message .= "👤 Имя: " . htmlspecialchars($data['name']) . "\n";
$message .= "📞 Телефон: " . htmlspecialchars($data['phone']) . "\n";
$message .= "📧 Почта: " . (!empty($data['email']) ? htmlspecialchars($data['email']) : 'не указана') . "\n";

if ($isBooking) {
    $message .= "📅 Дата рождения: " . htmlspecialchars($data['birthdate']) . "\n";
    $message .= "📄 Паспорт: " . htmlspecialchars($data['passport']) . "\n";
    $message .= "✈️ Тур: " . htmlspecialchars($data['trip']) . "\n";
    $message .= "🏙️ Город выезда: " . htmlspecialchars($data['city']) . "\n";
    if (!empty($data['accommodation'])) {
        $message .= "🏨 Размещение: " . htmlspecialchars($data['accommodation']) . "\n";
    }
} else {
    $message .= "📝 Сообщение: " . (!empty($data['text']) ? htmlspecialchars($data['text']) : 'не указано') . "\n";
}

$message .= "✅ Пользователь согласен с договором-офертой?: " . ($data['agreement'] ? 'Да' : 'Нет');

// Отправляем запрос к API Telegram
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.telegram.org/bot{$TOKEN}/sendMessage");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'chat_id' => $CHAT_ID,
    'text' => $message,
    'parse_mode' => 'HTML',
    'message_thread_id' => $MESSAGE_THREAD
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Отключаем проверку SSL для отладки

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Логируем ошибки cURL
if ($response === false) {
    error_log("cURL Error: " . curl_error($ch));
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send message: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

// Логируем ответ от Telegram
error_log("Telegram API Response: " . $response);
error_log("HTTP Code: " . $httpCode);

curl_close($ch);

// Если это бронирование, генерируем и отправляем договор-оферту
if ($isBooking) {
    $contractResult = generateAndSendContract($data['name'], $TOKEN, $CHAT_ID, $BOOKING_THREAD);
    if (!$contractResult['success']) {
        error_log("Failed to send contract: " . $contractResult['error']);
    }
}

// Отправляем ответ клиенту
if ($httpCode === 200) {
    error_log("Sending success response");
    header('Content-Type: application/json');
    echo json_encode(['success' => true]);
    exit;
} else {
    error_log("Sending error response. HTTP Code: " . $httpCode);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Failed to send message. HTTP Code: ' . $httpCode]);
    exit;
}

// Функция для генерации и отправки договора-оферты
function generateAndSendContract($clientName, $token, $chatId, $threadId) {
    error_log("Starting contract generation for: " . $clientName);
    
    // Получаем текущую дату
    $currentDate = date('d.m.Y');
    $currentYear = date('Y');
    
    error_log("Reading contract template...");
    
    // Читаем шаблон договора
    $contractTemplate = file_get_contents('offer.html');
    
    if (!$contractTemplate) {
        error_log("Failed to read offer.html");
        return ['success' => false, 'error' => 'Failed to read contract template'];
    }
    
    error_log("Replacing placeholders...");
    
    // Заменяем плейсхолдеры
    $contractContent = str_replace(
        [
            'г. _____________ «____» _________202  г.',
            'Заказчик ______________________________________________________ / _________________/',
            'от «____» _________202  г.'
        ],
        [
            "г. Волгодонск «" . date('d') . "» " . getMonthName(date('n')) . " " . $currentYear . " г.",
            "Заказчик " . $clientName . " / _________________/",
            "от «" . date('d') . "» " . getMonthName(date('n')) . " " . $currentYear . " г."
        ],
        $contractTemplate
    );
    
    error_log("Converting to HTML...");
    
    // Создаем HTML файл (Word его откроет)
    $htmlFile = createHtmlFile($contractContent, $clientName);
    
    if (!$htmlFile) {
        error_log("Failed to create HTML file, trying text file...");
        // Если конвертация не удалась, создаем простой текстовый файл
        $textContent = strip_tags($contractContent);
        $textContent = html_entity_decode($textContent, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        $tempFile = tempnam(sys_get_temp_dir(), 'contract_') . '.txt';
        file_put_contents($tempFile, $textContent);
        $fileName = 'Договор-оферта_' . $clientName . '.txt';
        $mimeType = 'text/plain; charset=utf-8';
    } else {
        $tempFile = $htmlFile;
        $fileName = 'Договор-оферта_' . $clientName . '.html';
        $mimeType = 'text/html; charset=utf-8';
    }
    
    error_log("Sending file to Telegram...");
    
    // Отправляем файл в Telegram
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.telegram.org/bot{$token}/sendDocument");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'chat_id' => $chatId,
        'document' => new CURLFile($tempFile, $mimeType, $fileName),
        'caption' => "📄 Договор-оферта для клиента: " . $clientName . "\n📅 Дата: " . $currentDate,
        'message_thread_id' => $threadId
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Добавляем таймаут
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    // Удаляем временный файл
    unlink($tempFile);
    
    curl_close($ch);
    
    error_log("Telegram response: " . $response);
    error_log("HTTP Code: " . $httpCode);
    
    if ($httpCode === 200) {
        return ['success' => true];
    } else {
        return ['success' => false, 'error' => 'HTTP Code: ' . $httpCode . ', Response: ' . $response];
    }
}

// Функция для конвертации HTML в DOCX
function convertHtmlToDocx($htmlContent, $clientName) {
    // Устанавливаем заголовки для Word
    $htmlContent = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Договор-оферта</title>
    <style>
        body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 1.5; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 20pt; }
        h2 { font-size: 14pt; font-weight: bold; margin-top: 20pt; margin-bottom: 10pt; }
        h3 { font-size: 13pt; font-weight: bold; margin-top: 15pt; margin-bottom: 8pt; }
        h4 { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
        p { margin-bottom: 8pt; text-align: justify; }
        ul, ol { margin-bottom: 8pt; }
        li { margin-bottom: 3pt; }
    </style>
</head>
<body>' . $htmlContent . '</body></html>';
    
    // Создаем временный HTML файл
    $tempHtmlFile = tempnam(sys_get_temp_dir(), 'contract_html_') . '.html';
    file_put_contents($tempHtmlFile, $htmlContent);
    
    // Создаем временный DOCX файл
    $tempDocxFile = tempnam(sys_get_temp_dir(), 'contract_docx_') . '.docx';
    
    // Используем pandoc для конвертации (если установлен)
    $pandocCommand = "pandoc \"{$tempHtmlFile}\" -o \"{$tempDocxFile}\" --from html --to docx";
    $output = shell_exec($pandocCommand . ' 2>&1');
    
    // Удаляем временный HTML файл
    unlink($tempHtmlFile);
    
    // Проверяем, создался ли DOCX файл
    if (file_exists($tempDocxFile) && filesize($tempDocxFile) > 0) {
        return $tempDocxFile;
    }
    
    // Если pandoc не работает, создаем HTML файл
    $htmlFile = createHtmlFile($htmlContent, $clientName);
    
    if ($htmlFile) {
        return $htmlFile;
    }
    
    // Если HTML не получился, создаем простой текстовый файл
    return createTextFile($htmlContent, $clientName);
}

// Функция создания HTML файла (Word его откроет)
function createHtmlFile($htmlContent, $clientName) {
    error_log("Starting HTML creation...");
    
    // Проверяем, есть ли уже HTML структура
    if (strpos($htmlContent, '<!DOCTYPE html>') === false) {
        // Добавляем правильную структуру HTML для Word
        $htmlContent = '<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Договор-оферта</title>
    <style>
        body { 
            font-family: "Times New Roman", serif; 
            font-size: 12pt; 
            line-height: 1.5; 
            margin: 2cm;
            text-align: justify;
        }
        h1 { 
            font-size: 16pt; 
            font-weight: bold; 
            text-align: center; 
            margin-bottom: 20pt; 
        }
        h2 { 
            font-size: 14pt; 
            font-weight: bold; 
            margin-top: 20pt; 
            margin-bottom: 10pt; 
        }
        h3 { 
            font-size: 13pt; 
            font-weight: bold; 
            margin-top: 15pt; 
            margin-bottom: 8pt; 
        }
        h4 { 
            font-size: 12pt; 
            font-weight: bold; 
            margin-top: 12pt; 
            margin-bottom: 6pt; 
        }
        p { 
            margin-bottom: 8pt; 
            text-align: justify; 
        }
        ul, ol { 
            margin-bottom: 8pt; 
            margin-left: 20pt;
        }
        li { 
            margin-bottom: 3pt; 
        }
        .offer {
            max-width: none;
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>' . $htmlContent . '</body></html>';
    }
    
    error_log("Creating HTML file...");
    
    // Создаем HTML файл (Word его откроет)
    $htmlFile = tempnam(sys_get_temp_dir(), 'contract_html_') . '.html';
    $result = file_put_contents($htmlFile, $htmlContent);
    
    if ($result === false) {
        error_log("Failed to write HTML file");
        return false;
    }
    
    error_log("HTML file created successfully: " . $htmlFile);
    return $htmlFile;
}

// Функция создания текстового файла
function createTextFile($htmlContent, $clientName) {
    // Очищаем HTML от тегов и форматируем для текста
    $text = strip_tags($htmlContent);
    
    // Конвертируем в UTF-8 если нужно
    if (!mb_check_encoding($text, 'UTF-8')) {
        $text = mb_convert_encoding($text, 'UTF-8', 'auto');
    }
    
    // Конвертируем UTF-8 в Windows-1251 для текста
    $text = iconv('UTF-8', 'Windows-1251//IGNORE', $text);
    
    // Создаем текстовый файл
    $tempFile = tempnam(sys_get_temp_dir(), 'contract_text_') . '.txt';
    file_put_contents($tempFile, $text);
    
    return $tempFile;
}

// Функция для получения названия месяца на русском языке
function getMonthName($monthNumber) {
    $months = [
        1 => 'января',
        2 => 'февраля',
        3 => 'марта',
        4 => 'апреля',
        5 => 'мая',
        6 => 'июня',
        7 => 'июля',
        8 => 'августа',
        9 => 'сентября',
        10 => 'октября',
        11 => 'ноября',
        12 => 'декабря'
    ];
    
    return $months[$monthNumber] ?? 'января';
}