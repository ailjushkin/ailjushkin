// services/audioAnalyzer.js

/**
 * Модуль для анализа аудио файлов
 * Содержит функции для обработки аудио и извлечения информации об аккордах
 */

/**
 * Инициализация аудио контекста
 * @returns {AudioContext} созданный или существующий аудио контекст
 */
export const initAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    console.error('AudioContext не поддерживается в этом браузере');
    return null;
  }
  return new AudioContext();
};

/**
 * Декодирование аудио данных
 * @param {AudioContext} audioContext - аудио контекст
 * @param {ArrayBuffer} arrayBuffer - ArrayBuffer с аудио данными
 * @returns {Promise<AudioBuffer>} промис с декодированным аудио
 */
export const decodeAudioData = async (audioContext, arrayBuffer) => {
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    console.log('Аудио успешно декодировано', audioBuffer);
    return audioBuffer;
  } catch (error) {
    console.error('Ошибка декодирования аудио:', error);
    throw error;
  }
};

/**
 * Анализ аудио для извлечения аккордов
 * В реальном проекте здесь будет сложный алгоритм распознавания
 * @param {AudioBuffer} audioBuffer - декодированный аудио буфер
 * @param {string} guitarType - тип гитары
 * @returns {Promise<Array>} массив с найденными аккордами
 */
export const analyzeChords = async (audioBuffer, guitarType) => {
  console.log('Начало анализа аккордов для типа гитары:', guitarType);
  
  // Временная задержка для имитации анализа
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Получаем данные о каналах и длительности
  const duration = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  
  console.log(`Длительность: ${duration} сек, Частота дискретизации: ${sampleRate} Hz`);
  
  // В реальном проекте здесь будет:
  // 1. Анализ спектра аудио
  // 2. Выделение основных частот
  // 3. Сопоставление с базой аккордов
  // 4. Определение временных меток
  
  // Примерная генерация аккордов на основе длительности
  const estimatedChordCount = Math.floor(duration / 3);
  const chords = [];
  
  for (let i = 0; i < estimatedChordCount; i++) {
    const startTime = i * 3;
    const endTime = Math.min(startTime + 3, duration);
    
    // Генерируем случайный аккорд (в реальном проекте - реальный алгоритм)
    const mockChord = generateMockChord(guitarType, i);
    
    chords.push({
      chord: mockChord.chord,
      startTime: startTime,
      endTime: endTime,
      strings: mockChord.strings,
      confidence: Math.random() * 0.5 + 0.5 // Уверенность алгоритма
    });
  }
  
  console.log(`Найдено ${chords.length} аккордов`);
  return chords;
};

/**
 * Генерация фиктивного аккорда на основе типа гитары
 * @param {string} guitarType - тип гитары
 * @param {number} index - индекс аккорда
 * @returns {Object} объект с данными аккорда
 */
const generateMockChord = (guitarType, index) => {
  const chordsMap = {
    'standard_6': ['C', 'G', 'Am', 'F', 'Em', 'D', 'A', 'E'],
    'bass_4': ['C', 'G', 'D', 'A'],
    'seven_string': ['C', 'G', 'Am', 'F', 'B', 'D', 'A', 'E'],
    'eight_string': ['C', 'G', 'Am', 'F', 'B', 'D', 'A', 'E', 'C'],
    'ukulele': ['C', 'G', 'Am', 'F', 'D', 'Em', 'A', 'E']
  };
  
  const availableChords = chordsMap[guitarType] || chordsMap['standard_6'];
  const chordName = availableChords[index % availableChords.length];
  
  // Генерируем фейковые позиции ладов
  const stringsCount = getStringsCount(guitarType);
  const strings = [];
  
  for (let i = 0; i < stringsCount; i++) {
    strings.push(Math.floor(Math.random() * 5));
  }
  
  return {
    chord: chordName,
    strings: strings
  };
};

/**
 * Получение количества струн для типа гитары
 * @param {string} guitarType - тип гитары
 * @returns {number} количество струн
 */
export const getStringsCount = (guitarType) => {
  const stringsMap = {
    'standard_6': 6,
    'bass_4': 4,
    'seven_string': 7,
    'eight_string': 8,
    'ukulele': 4
  };
  
  return stringsMap[guitarType] || 6;
};

/**
 * Транспонирование аккорда на заданное количество полутонов
 * @param {string} chordName - название аккорда
 * @param {number} semitones - количество полутонов
 * @returns {string} транспонированный аккорд
 */
export const transposeChord = (chordName, semitones) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Извлекаем базовую ноту и расширение
  const match = chordName.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chordName;
  
  const baseNote = match[1];
  const extension = match[2];
  
  // Находим индекс базовой ноты
  let noteIndex = notes.indexOf(baseNote);
  if (noteIndex === -1) {
    // Если это бемоль, преобразуем
    const flatToSharp = {
      'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    if (flatToSharp[baseNote]) {
      noteIndex = notes.indexOf(flatToSharp[baseNote]);
    }
  }
  
  // Применяем транспонирование
  const newIndex = (noteIndex + semitones + 12) % 12;
  const newBaseNote = notes[newIndex];
  
  return newBaseNote + extension;
};
