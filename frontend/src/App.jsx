import { useState, useRef } from 'react';
import './App.css';

const LANGUAGES = [
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸', voice: 'Neural-ES-Sofia', freq: 440 },
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳', voice: 'Neural-HI-Aarav', freq: 493.88 },
  { code: 'ml', name: 'Malayalam (മലയാളം)', flag: '🇮🇳', voice: 'Neural-ML-Kiran', freq: 523.25 },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷', voice: 'Neural-FR-Chloé', freq: 392.00 },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪', voice: 'Neural-DE-Lukas', freq: 349.23 },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵', voice: 'Neural-JA-Haruto', freq: 587.33 },
  { code: 'ko', name: 'Korean (한국어)', flag: '🇰🇷', voice: 'Neural-KO-Jihoon', freq: 659.25 },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦', voice: 'Neural-AR-Layla', freq: 415.30 },
  { code: 'en', name: 'English (US/UK)', flag: '🇺🇸', voice: 'Neural-EN-Aria', freq: 466.16 },
  { code: 'zh', name: 'Chinese (中文)', flag: '🇨🇳', voice: 'Neural-ZH-Xiaoyu', freq: 554.37 },
];

const PIPELINE_STEPS = [
  { id: 1, label: 'Uploading Audio', desc: 'Sending multipart/form-data payload' },
  { id: 2, label: 'Transcribing Speech', desc: 'Extracting source speech via ASR' },
  { id: 3, label: 'Translating Text', desc: 'Neural machine translation to target language' },
  { id: 4, label: 'Synthesizing Target WAV', desc: 'Generating translated voice waveform' },
];

const API_ENDPOINT = 'http://localhost:8000/api/translate-speech';

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState(null);
  // Initialized to the full name string instead of 'es'
  const [targetLang, setTargetLang] = useState('Spanish (Español)');
  const [isRecording, setIsRecording] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [resultAudioUrl, setResultAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const stepIntervalRef = useRef(null);

  // Find by name instead of code
  const selectedLanguageObj = LANGUAGES.find((l) => l.name === targetLang);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFile(file);
    setSourcePreviewUrl(URL.createObjectURL(file));
    setErrorMessage('');
    setResultAudioUrl(null);
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        setErrorMessage('');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const recordedFile = new File([audioBlob], 'mic_recording.webm', {
            type: 'audio/webm',
          });
          setAudioFile(recordedFile);
          setSourcePreviewUrl(URL.createObjectURL(audioBlob));
          setResultAudioUrl(null);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        setErrorMessage('Microphone access denied or unavailable. Please check permissions.');
      }
    }
  };

  const handleTranslate = async () => {
    if (!audioFile) {
      setErrorMessage('Please choose an audio file or record from your microphone first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setResultAudioUrl(null);
    setCurrentStepIndex(0);
    setProgressPercent(15);

    stepIntervalRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < PIPELINE_STEPS.length - 1 ? prev + 1 : prev));
      setProgressPercent((prev) => (prev < 90 ? prev + 20 : prev));
    }, 1800);

    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile, audioFile.name || 'input_audio.wav');
      formData.append('target_lang', targetLang); // Sends full name e.g. "Hindi (हिन्दी)"

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      clearInterval(stepIntervalRef.current);

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `Backend returned error ${response.status}`);
      }

      setProgressPercent(100);
      const wavBlob = await response.blob();
      const wavUrl = URL.createObjectURL(wavBlob);
      setResultAudioUrl(wavUrl);
    } catch (err) {
      clearInterval(stepIntervalRef.current);
      setErrorMessage(err.message || 'Failed to connect to the translation backend.');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeStep = PIPELINE_STEPS[currentStepIndex];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Speech-to-Speech Translator</h1>
          <p className="text-slate-400 text-sm">
            Upload or record audio, select a target language, and download the translated WAV.
          </p>
        </div>

        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <label htmlFor="audioInput" className="block text-sm font-medium text-slate-300">
            1. Choose or Record Audio
          </label>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              id="audioInput"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="block flex-1 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
            <button
              id="recordBtn"
              type="button"
              onClick={handleRecordToggle}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition ${
                isRecording
                  ? 'bg-amber-600 hover:bg-amber-500 animate-pulse'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {isRecording ? '⏹️ Stop Recording' : '🎙️ Record Mic'}
            </button>
          </div>

          {sourcePreviewUrl && (
            <audio src={sourcePreviewUrl} controls className="w-full mt-3" />
          )}
        </div>

        <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center">
            <label htmlFor="languageSelect" className="block text-sm font-medium text-slate-300">
              2. Target Language
            </label>
            {selectedLanguageObj && (
              <span className="text-xs text-indigo-400 font-mono">
                Voice: {selectedLanguageObj.voice}
              </span>
            )}
          </div>
          <select
            id="languageSelect"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          id="translateBtn"
          onClick={handleTranslate}
          disabled={!audioFile || isProcessing || isRecording}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-semibold text-white shadow-lg transition cursor-pointer disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing Audio...' : 'Translate Audio'}
        </button>

        {isProcessing && (
          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-indigo-300 font-medium">
              <span>
                Step {activeStep.id}/4: {activeStep.label} — {activeStep.desc}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-sm">
            ⚠️ {errorMessage}
          </div>
        )}

        {resultAudioUrl && (
          <div className="space-y-4 bg-emerald-950/30 border border-emerald-800/60 p-4 rounded-xl">
            <div className="text-sm font-semibold text-emerald-300">
              ✓ Translation Complete! ({selectedLanguageObj?.flag} {selectedLanguageObj?.name})
            </div>
            <audio src={resultAudioUrl} controls className="w-full" />
            <a
              href={resultAudioUrl}
              download={`translated_audio.wav`}
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition"
            >
              ⬇ Download Translated WAV
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;