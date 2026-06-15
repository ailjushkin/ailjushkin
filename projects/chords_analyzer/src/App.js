import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/**
 * Основной компонент приложения
 * Реализует интерфейс браузерного анализатора аккордов
 */
function App() {
  // Состояния приложения
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [guitarType, setGuitarType] = useState('standard_6');
  const [audioContext, setAudioContext] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [analyzedChords, setAnalyzedChords] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8); // Начальная громкость 80%
  const [analyzingStage, setAnalyzingStage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Refs для работы с аудио
  const audioSourceRef = useRef(null); // AudioBufferSourceNode reference
  const canvasRef = useRef(null);
  const gainNodeRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null); // Время начала воспроизведения
  const pauseTimeRef = useRef(null); // Время на котором остановилось воспроизведение

  /**
   * Инициализация аудио контекста при монтировании компонента
   */
  useEffect(() => {
    const initAudioContext = () => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const gainNode = ctx.createGain();
      const analyser = ctx.createAnalyser();
      
      gainNode.connect(ctx.destination);
      analyser.connect(gainNode);
      
      setAudioContext(ctx);
      gainNodeRef.current = gainNode;
      analyserRef.current = analyser;
    };

    initAudioContext();
  }, []);

  /**
   * Обработчик изменения размера канваса
   */
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Инициализация размера

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /**
   * Отрисовка осциллограммы на canvas с учетом разрешения экрана
   * Вызывается после загрузки аудио файла
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer || canvasSize.width === 0) return;

    // Учет devicePixelRatio для четкости на высокоразрешенных экранах
    const dpr = window.devicePixelRatio || 1;
    
    // Устанавливаем фактический размер канваса с учетом разрешения
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;

    const ctx = canvas.getContext('2d');
    // Масштабируем контекст, чтобы рисовать в CSS пикселях
    ctx.scale(dpr, dpr);
    
    const width = canvasSize.width;
    const height = canvasSize.height;

    // Очистка канваса
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Получение данных волновой формы
    const channelData = audioBuffer.getChannelData(0);
    const sampleCount = channelData.length;
    const step = Math.ceil(sampleCount / width);

    // Массив для хранения амплитуд
    const ampArray = [];
    for (let i = 0; i < width; i++) {
      let max = 0;
      for (let j = 0; j < step; j++) {
        const sample = Math.abs(channelData[i * step + j]);
        if (sample > max) {
          max = sample;
        }
      }
      if (max > 0) {
        ampArray.push(max);
      }
    }

    // Отрисовка волны вертикальными четкими колонками
    const centerY = height / 2;
    const amplitudeScale = height / 2.5;
    const barWidth = 2; // Толщина колонки в пикселях (четкая граница)
    const barSpacing = 0; // Нет пробелов между колонками

    ctx.fillStyle = '#00d4ff';

    for (let i = 0; i < width; i++) {
      const amp = ampArray[i] || 0;
      const amplitude = amp * amplitudeScale;
      const yTop = centerY - amplitude;
      
      // Отрисовка верхней половины волны
      if (amplitude > 0.01) {
        ctx.fillRect(i * (barWidth + barSpacing), yTop, barWidth, amplitude);
      }
      
      // Отрисовка нижней половины волны (зеркально)
      if (amplitude > 0.01) {
        ctx.fillRect(i * (barWidth + barSpacing), centerY, barWidth, amplitude);
      }
    }

    // Отрисовка линии центра
    ctx.fillStyle = '#333';
    ctx.fillRect(0, centerY, width, 1);

    console.log('Осиlлограмма отрисована с учетом разрешения экрана');
  }, [audioBuffer, canvasSize]);

  /**
   * Отрисовка ползунка воспроизведения на осциллограмме
   */
  useEffect(() => {
    if (!isPlaying || !canvasRef.current || !audioBuffer || canvasSize.width === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Учет devicePixelRatio для четкости на высокоразрешенных экранах
    const dpr = window.devicePixelRatio || 1;
    
    // Устанавливаем фактический размер канваса с учетом разрешения
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;

    // Масштабируем контекст, чтобы рисовать в CSS пикселях
    ctx.scale(dpr, dpr);
    
    const width = canvasSize.width;
    const height = canvasSize.height;

    const drawPlayHead = () => {
      // Очистка канваса
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);

      // Получение данных волновой формы
      const channelData = audioBuffer.getChannelData(0);
      const sampleCount = channelData.length;
      const step = Math.ceil(sampleCount / width);
      const ampArray = [];
      for (let i = 0; i < width; i++) {
        let max = 0;
        for (let j = 0; j < step; j++) {
          const sample = Math.abs(channelData[i * step + j]);
          if (sample > max) {
            max = sample;
          }
        }
        if (max > 0) {
          ampArray.push(max);
        }
      }

      const centerY = height / 2;
      const amplitudeScale = height / 2.5;
      const barWidth = 2; // Толщина колонки в пикселях (четкая граница)

      // Отрисовка волны вертикальными четкими колонками
      ctx.fillStyle = '#00d4ff';

      for (let i = 0; i < width; i++) {
        const amp = ampArray[i] || 0;
        const amplitude = amp * amplitudeScale;
        const yTop = centerY - amplitude;
        
        if (amplitude > 0.01) {
          ctx.fillRect(i * barWidth, yTop, barWidth, amplitude);
        }
        
        if (amplitude > 0.01) {
          ctx.fillRect(i * barWidth, centerY, barWidth, amplitude);
        }
      }

      // Отрисовка линии центра
      ctx.fillStyle = '#333';
      ctx.fillRect(0, centerY, width, 1);

      // Положение ползунка
      const playHeadX = (currentTime / audioBuffer.duration) * width;

      // Отрисовка ползунка
      ctx.beginPath();
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.moveTo(playHeadX, 0);
      ctx.lineTo(playHeadX, height);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(drawPlayHead);
    };

    drawPlayHead();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, audioBuffer, currentTime, canvasSize]);

  /**
   * Обработчик загрузки аудио файла
   * @param {Event} event - событие загрузки файла
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Добавляем трек в список
    const track = {
      id: Date.now(),
      name: file.name,
      file: file,
      size: file.size,
      uploadedAt: new Date(),
      analysisStatus: 'pending',
      chords: []
    };

    setTracks(prev => [...prev, track]);
    setSelectedTrack(track);

    // Начинаем анализ
    await analyzeTrack(track);
  };

  /**
   * Анализ аудио трека
   * Выполняется асинхронно для предотвращения блокировки UI
   */
  const analyzeTrack = async (track) => {
    setAnalyzingStage('reading_file');
    
    try {
      // Читаем файл как ArrayBuffer
      const arrayBuffer = await track.file.arrayBuffer();
      setAnalyzingStage('decoding_audio');
      
      // Декодируем аудио
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setAudioBuffer(audioBuffer);
      
      setAnalyzingStage('detecting_chords');
      
      // Имитация анализа аккордов (в реальном проекте здесь будет алгоритм распознавания)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const chords = generateMockChords();
      setAnalyzedChords(chords);
      
      setAnalyzingStage('complete');
      
      // Обновляем статус трека
      setTracks(prev => prev.map(t => 
        t.id === track.id ? { ...t, analysisStatus: 'complete', chords } : t
      ));
      
    } catch (error) {
      console.error('Ошибка при анализе трека:', error);
      setAnalyzingStage('error');
    }
  };

  /**
   * Генерация фиктивных аккордов для демонстрации
   * @returns {Array} массив аккордов
   */
  const generateMockChords = () => {
    const mockChords = [
      { chord: 'C', startTime: 0, endTime: 2, strings: [3, 3, 0, 0, 1, 0] },
      { chord: 'G', startTime: 2, endTime: 4, strings: [3, 2, 0, 0, 0, 3] },
      { chord: 'Am', startTime: 4, endTime: 6, strings: [5, 3, 0, 0, 0, 0] },
      { chord: 'F', startTime: 6, endTime: 8, strings: [1, 3, 3, 2, 1, 1] },
      { chord: 'Em', startTime: 8, endTime: 10, strings: [0, 2, 2, 0, 0, 0] },
      { chord: 'D', startTime: 10, endTime: 12, strings: [2, 2, 0, 0, 3, 2] },
      { chord: 'A', startTime: 12, endTime: 14, strings: [0, 2, 2, 1, 0, 0] },
      { chord: 'E', startTime: 14, endTime: 16, strings: [0, 2, 2, 0, 0, 0] },
    ];
    
    return mockChords;
  };

  /**
   * Воспроизведение аудио
   * Реализует play/pause functionality для AudioBufferSourceNode
   */
  const playAudio = async () => {
    if (!audioContext || !audioBuffer) return;

    if (isPlaying) {
      // Если уже играет - ставим на паузу
      if (audioSourceRef.current) {
        // Останавливаем источник
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
        
        // Вычисляем текущее время воспроизведения
        const pausedTime = audioContext.currentTime - startTimeRef.current;
        pauseTimeRef.current = pausedTime;
        
        setIsPlaying(false);
        setCurrentTime(pausedTime);
        console.log(`Аудио на паузе в момент: ${pausedTime.toFixed(2)} сек`);
      }
    } else {
      // Если на паузе - возобновляем или начинаем новое воспроизведение
      if (pauseTimeRef.current !== null && pauseTimeRef.current > 0) {
        // Возобновляем с места паузы
        await resumeAudio(pauseTimeRef.current);
      } else {
        // Начинаем с начала
        await resumeAudio(0);
      }
    }
  };

  /**
   * Воспроизведение аудио с указанного времени
   * @param {number} startTime - время в секундах
   */
  const resumeAudio = async (startTime) => {
    if (!audioContext || !audioBuffer) return;

    // Останавливаем предыдущий источник если есть
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Игнорируем ошибки при остановке уже остановленного источника
      }
    }

    // Создаем новый источник аудио
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Подключаем к узлам
    source.connect(analyserRef.current);
    analyserRef.current.connect(gainNodeRef.current);
    
    // Устанавливаем громкость
    gainNodeRef.current.gain.value = volume;
    
    // Сохраняем ссылку
    audioSourceRef.current = source;
    
    // Настройка обработчиков событий
    source.onended = () => {
      setIsPlaying(false);
      setCurrentTime(audioBuffer.duration);
      pauseTimeRef.current = null;
      console.log('Воспроизведение завершено');
    };
    
    // Запускаем воспроизведение с указанного времени
    source.start(startTime);
    startTimeRef.current = audioContext.currentTime - startTime;
    
    setIsPlaying(true);
    setCurrentTime(startTime);
    console.log(`Воспроизведение начато с: ${startTime.toFixed(2)} сек`);
  };

  /**
   * Обработчик изменения громкости
   * @param {Event} event - событие изменения значения ползунка
   */
  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    
    // Обновляем громкость в реальном времени
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
      console.log(`Громкость изменена на: ${(newVolume * 100).toFixed(0)}%`);
    }
  };

  /**
   * Переход к определенному времени при клике на аккорд
   * @param {number} time - время в секундах
   */
  const jumpToTime = (time) => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Игнорируем ошибки при остановке
      }
    }
    
    if (audioContext && audioBuffer) {
      resumeAudio(time);
    }
  };

  /**
   * Остановка воспроизведения
   */
  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Игнорируем ошибки при остановке
      }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    pauseTimeRef.current = null;
    console.log('Воспроизведение остановлено');
  };

  /**
   * Транспонирование аккордов
   * @param {number} semitones - количество полутонов для транспонирования
   */
  const transposeChords = (semitones) => {
    // В реальном проекте здесь будет логика транспонирования
    console.log(`Транспонирование на ${semitones} полутонов`);
  };

  /**
   * Форматирование времени в формат MM:SS
   * @param {number} seconds - время в секундах
   * @returns {string} отформатированное время
   */
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="App">
      {/* Шапка с логотипом и управлениями */}
      <header className="app-header">
        <div className="logo">guitar.ai</div>
        <div className="header-controls">
          <div className="file-upload-container">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              id="file-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="btn btn-primary">
              Загрузить трек
            </label>
          </div>
          
          <select
            value={guitarType}
            onChange={(e) => setGuitarType(e.target.value)}
            className="btn btn-secondary"
          >
            <option value="standard_6">Гитара 6-струнная</option>
            <option value="bass_4">Бас-гитара 4-струнная</option>
            <option value="seven_string">Гитара 7-струнная</option>
            <option value="eight_string">Гитара 8-струнная</option>
            <option value="ukulele">Укулеле</option>
          </select>
          
          <div className="transpose-controls">
            <button
              className="btn btn-small"
              onClick={() => transposeChords(-1)}
            >
              ♭
            </button>
            <button
              className="btn btn-small"
              onClick={() => transposeChords(1)}
            >
              ♯
            </button>
          </div>
        </div>
      </header>

      {/* Осциллограмма */}
      <div className="waveform-container">
        <canvas ref={canvasRef} className="waveform-canvas" />
      </div>

      {/* Кнопки управления воспроизведением */}
      <div className="playback-controls">
        <button
          className={`btn ${isPlaying ? 'btn-warning' : 'btn-success'}`}
          onClick={playAudio}
        >
          {isPlaying ? 'Пауза' : 'Играть'}
        </button>
        <button className="btn btn-danger" onClick={stopAudio}>
          Стоп
        </button>
        
        {/* Регулятор громкости */}
        <div className="volume-control">
          <svg
            className="volume-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            {volume > 0 && volume < 0.3 && (
              <line x1="23" y1="9" x2="17" y2="15"></line>
            )}
            {volume >= 0.3 && volume < 0.6 && (
              <line x1="23" y1="9" x2="17" y2="15"></line>
            )}
            {volume >= 0.6 && (
              <line x1="23" y1="9" x2="17" y2="15"></line>
            )}
            {volume > 0 && (
              <line x1="23" y1="15" x2="17" y2="9"></line>
            )}
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            title={`Громкость: ${(volume * 100).toFixed(0)}%`}
          />
        </div>
      </div>

      {/* Индикатор анализа */}
      {analyzingStage && (
        <div className="analysis-status">
          {analyzingStage === 'reading_file' && 'Чтение файла...'}
          {analyzingStage === 'decoding_audio' && 'Декодирование аудио...'}
          {analyzingStage === 'detecting_chords' && 'Обнаружение аккордов...'}
          {analyzingStage === 'complete' && 'Анализ завершен'}
          {analyzingStage === 'error' && 'Ошибка анализа'}
        </div>
      )}

      {/* Распознанные аккорды */}
      <div className="chords-container">
        <h2>Распознанные аккорды</h2>
        {analyzedChords.length > 0 ? (
          <div className="chords-grid">
            {analyzedChords.map((chord, index) => (
              <div
                key={index}
                className="chord-card"
                onClick={() => jumpToTime(chord.startTime)}
              >
                <div className="chord-name">{chord.chord}</div>
                <div className="chord-tablature">
                  {chord.strings.map((fret, stringIndex) => (
                    <div key={stringIndex} className="string-fret">
                      <span className="string">{stringIndex + 1}</span>
                      <span className="fret">{fret === 0 ? '0' : fret}</span>
                    </div>
                  ))}
                </div>
                <div className="chord-timestamp">
                  {formatTime(chord.startTime)} - {formatTime(chord.endTime)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-chords">
            Загрузите аудио-файл для анализа
          </div>
        )}
      </div>

      {/* История файлов */}
      <div className="history-container">
        <h2>История анализированных файлов</h2>
        {tracks.length > 0 ? (
          <div className="history-list">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`history-item ${selectedTrack?.id === track.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTrack(track);
                  // В реальном проекте загрузим сохраненные данные трека
                }}
              >
                <span className="track-name">{track.name}</span>
                <span className="track-status">
                  {track.analysisStatus === 'pending' && '⏳ Анализ...'}
                  {track.analysisStatus === 'complete' && '✅ Готово'}
                  {track.analysisStatus === 'error' && '❌ Ошибка'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-history">
            Нет загруженных файлов
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
