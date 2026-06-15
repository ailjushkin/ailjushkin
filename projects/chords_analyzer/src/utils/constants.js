// utils/constants.js

/**
 * Константы проекта
 */

// Типы гитар
export const GUITAR_TYPES = {
  STANDARD_6: 'standard_6',
  BASS_4: 'bass_4',
  SEVEN_STRING: 'seven_string',
  EIGHT_STRING: 'eight_string',
  UKULELE: 'ukulele'
};

// Названия типов гитар для UI
export const GUITAR_TYPE_NAMES = {
  [GUITAR_TYPES.STANDARD_6]: 'Гитара 6-струнная',
  [GUITAR_TYPES.BASS_4]: 'Бас-гитара 4-струнная',
  [GUITAR_TYPES.SEVEN_STRING]: 'Гитара 7-струнная',
  [GUITAR_TYPES.EIGHT_STRING]: 'Гитара 8-струнная',
  [GUITAR_TYPES.UKULELE]: 'Укулеле'
};

// Количество струн для каждого типа гитары
export const STRING_COUNTS = {
  [GUITAR_TYPES.STANDARD_6]: 6,
  [GUITAR_TYPES.BASS_4]: 4,
  [GUITAR_TYPES.SEVEN_STRING]: 7,
  [GUITAR_TYPES.EIGHT_STRING]: 8,
  [GUITAR_TYPES.UKULELE]: 4
};

// Базовые ноты
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Стандартная настройка струн для разных типов гитар (в нотах)
export const STANDARD_TUNINGS = {
  [GUITAR_TYPES.STANDARD_6]: ['E', 'B', 'G', 'D', 'A', 'E'], // от высокого к низкому
  [GUITAR_TYPES.BASS_4]: ['G', 'D', 'A', 'E'],
  [GUITAR_TYPES.SEVEN_STRING]: ['B', 'E', 'B', 'G', 'D', 'A', 'E'],
  [GUITAR_TYPES.EIGHT_STRING]: ['B', 'E', 'B', 'G', 'D', 'A', 'E', 'C#'],
  [GUITAR_TYPES.UKULELE]: ['A', 'E', 'C', 'G']
};

// Этапы анализа
export const ANALYSIS_STAGES = {
  PENDING: 'pending',
  READING_FILE: 'reading_file',
  DECODING_AUDIO: 'decoding_audio',
  DETECTING_CHORDS: 'detecting_chords',
  COMPLETE: 'complete',
  ERROR: 'error'
};

// Сообщения для этапов анализа
export const ANALYSIS_MESSAGES = {
  [ANALYSIS_STAGES.READING_FILE]: 'Чтение файла...',
  [ANALYSIS_STAGES.DECODING_AUDIO]: 'Декодирование аудио...',
  [ANALYSIS_STAGES.DETECTING_CHORDS]: 'Обнаружение аккордов...',
  [ANALYSIS_STAGES.COMPLETE]: 'Анализ завершен',
  [ANALYSIS_STAGES.ERROR]: 'Ошибка анализа'
};

// Максимальный размер загружаемого файла (100 МБ)
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Поддерживаемые форматы аудио
export const AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
