// utils/helpers.js

/**
 * Утилиты для работы с временем
 */

/**
 * Форматирование времени в формат MM:SS
 * @param {number} seconds - время в секундах
 * @returns {string} отформатированное время
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Парсинг времени из формата MM:SS
 * @param {string} timeString - строка времени в формате MM:SS
 * @returns {number} время в секундах
 */
export const parseTime = (timeString) => {
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;
  
  const mins = parseInt(parts[0], 10);
  const secs = parseInt(parts[1], 10);
  
  return mins * 60 + secs;
};

/**
 * Утилиты для работы с аккордами
 */

/**
 * Получение названия аккорда на основе нот
 * @param {Array} notes - массив нот
 * @returns {string} название аккорда
 */
export const getChordName = (notes) => {
  if (!notes || notes.length === 0) return 'Unknown';
  
  // Базовая реализация - в реальном проекте будет более сложная логика
  const rootNote = notes[0];
  return rootNote;
};

/**
 * Утилиты для работы с аудио
 */

/**
 * Создание URL для аудио файла
 * @param {File} file - файл аудио
 * @returns {string} object URL
 */
export const createAudioUrl = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Освобождение URL аудио файла
 * @param {string} url - object URL
 */
export const revokeAudioUrl = (url) => {
  URL.revokeObjectURL(url);
};
