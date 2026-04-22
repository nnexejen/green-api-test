const BASE_URL = 'https://api.green-api.com/waInstance';

// Получаем учётные данные
function getCredentials() {
  return {
    idInstance: document.getElementById('idInstance').value.trim(),
    apiToken: document.getElementById('apiToken').value.trim()
  };
}

// Функция вызова API
async function callApi(method, body = null) {
  const { idInstance, apiToken } = getCredentials();
  
  // Проверяем наличие учётных данных
  if (!idInstance || !apiToken) {
    document.getElementById('responseOutput').value = 'Ошибка: введите idInstance и ApiTokenInstance';
    return null;
  }

  // Формируем URL
  const url = `${BASE_URL}/${idInstance}/${method}/${apiToken}`;
  
  try {
    const response = await fetch(url, {
      method: body ? 'POST' : 'GET',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: body ? JSON.stringify(body) : null
    });
    
    // Парсим ответ (пока любой)
    const data = await response.json();
    
    // Проверяем на ошибки HTTP (4xx, 5xx)
    if (!response.ok) {
      const errorMessage = `HTTP ${response.status}: ${response.statusText}\n\n${JSON.stringify(data, null, 2)}`;
      document.getElementById('responseOutput').value = errorMessage;
      console.warn(`HTTP ${response.status}:`, data);
      return null;
    }
    
    // Выводим ответ
    document.getElementById('responseOutput').value = JSON.stringify(data, null, 2);
    return data;
    
  } catch (error) {
    // Сетевая ошибка (нет интернета, сервер недоступен и т.д.)
    document.getElementById('responseOutput').value = `Сетевая ошибка: ${error.message}\n\nПроверьте подключение к интернету.`;
    console.error('Fetch error:', error);
    return null;
  }
}

// Автоматическое добавление @c.us, если не указано
function formatChatId(chatId) {
  if (!chatId) return '';
  return chatId.includes('@') ? chatId : `${chatId}@c.us`;
}

// Автоматическое извлечение имени файла из URL
function extractFileName(urlFile) {
  try {
    const fileName = urlFile.split('/').pop();
    return (fileName && fileName.includes('.')) ? fileName : 'document';
  } catch {
    return 'document';
  }
}

// Очистка поля вывода
function clearOutput() {
  document.getElementById('responseOutput').value = '';
}

// Обработчики кнопок

// getSettings
async function getSettings() {
  await callApi('getSettings');
}

// getStateInstance
async function getStateInstance() {
  await callApi('getStateInstance');
}

// sendMessage
async function sendMessage() {
  const chatId = document.getElementById('chatIdMsg').value.trim();
  const message = document.getElementById('messageText').value.trim();
  
  // Проверяем корректность заполнения полей
  if (!chatId || !message) {
    document.getElementById('responseOutput').value = 'Ошибка: заполните chatId и текст сообщения\n\nchatId должен быть в формате:\n77771234567@c.us';
    return;
  }
  
  // Форматируем chatId (добавляем @c.us, если нужно)
  const formattedChatId = formatChatId(chatId);
  
  await callApi('sendMessage', { 
    chatId: formattedChatId, 
    message: message 
  });
}

// sendFileByUrl
async function sendFileByUrl() {
  const chatId = document.getElementById('chatIdFile').value.trim();
  const urlFile = document.getElementById('fileUrl').value.trim();
  
  // Проверяем корректность заполнения полей
  if (!chatId || !urlFile) {
    document.getElementById('responseOutput').value = 'Ошибка: заполните chatId и URL файла\n\nURL должен быть прямой ссылкой на файл,\nнапример: https://example.com/image.jpg';
    return;
  }
  
  // Форматируем chatId и извлекаем имя файла
  const formattedChatId = formatChatId(chatId);
  const fileName = extractFileName(urlFile);
  
  await callApi('sendFileByUrl', {
    chatId: formattedChatId,
    urlFile: urlFile,
    fileName: fileName,
    caption: 'Отправлено через GREEN-API (тестовое задание)'
  });
}

// Инициализация
console.log('GREEN-API скрипт загружен. Готов к работе.');
console.log('idInstance: ', document.getElementById('idInstance').value || 'не указан');