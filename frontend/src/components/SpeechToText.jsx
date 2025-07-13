import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  MessageSquare, 
  AlertCircle, 
  X, 
  Copy,
  Check,
  Volume2,
  Download,
  Settings,
  Languages
} from 'lucide-react';

const SpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const recognitionRef = useRef(null);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'es-MX', name: 'Spanish (Mexico)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'de-DE', name: 'German (Germany)' },
    { code: 'it-IT', name: 'Italian (Italy)' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese (Japan)' },
    { code: 'ko-KR', name: 'Korean (South Korea)' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)' },
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
    { code: 'hi-IN', name: 'Hindi (India)' },
    { code: 'nl-NL', name: 'Dutch (Netherlands)' },
    { code: 'ru-RU', name: 'Russian (Russia)' },
  ];

  useEffect(() => {
    // Check if speech recognition is supported
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setIsSupported(false);
      setError('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  useEffect(() => {
    // Update word count when transcript changes
    const words = finalTranscript.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [finalTranscript]);

  const startListening = () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
        console.log('Speech recognition started');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            final += transcript + ' ';
            setConfidence(confidence || 0);
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);
        if (final) {
          setFinalTranscript(prev => prev + final);
          setTranscript(prev => prev + final);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Speech recognition error: ';
        
        switch (event.error) {
          case 'network':
            errorMessage += 'Network error occurred. Please check your internet connection.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone access denied. Please allow microphone permissions.';
            break;
          case 'no-speech':
            errorMessage += 'No speech detected. Please try speaking clearly.';
            break;
          case 'audio-capture':
            errorMessage += 'Audio capture failed. Please check your microphone.';
            break;
          default:
            errorMessage += event.error;
        }
        
        setError(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        console.log('Speech recognition ended');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition. Please try again.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setFinalTranscript('');
    setInterimTranscript('');
    setError('');
    setConfidence(0);
    setWordCount(0);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(finalTranscript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setError('Failed to copy text to clipboard');
    }
  };

  const downloadTranscript = () => {
    if (!finalTranscript.trim()) return;
    
    const element = document.createElement('a');
    const file = new Blob([finalTranscript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const speakText = () => {
    if (!finalTranscript.trim()) return;
    
    const utterance = new SpeechSynthesisUtterance(finalTranscript);
    utterance.lang = language;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Mic className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Speech to Text</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Convert your speech to text in real-time with AI-powered speech recognition. Support for multiple languages and high accuracy.
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Mic className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">Voice Recognition</h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-white text-sm font-medium">
                  {isListening ? 'Listening...' : 'Ready'}
                </span>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress/Status Bar */}
          {isListening && (
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <span className="text-white text-sm">
                  {confidence > 0 && `${Math.round(confidence * 100)}% confident`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-100 dark:bg-gray-700 px-8 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-3">
                <Languages className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isListening}
                  className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Transcript Display */}
        <div className="p-8">
          <div className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 min-h-48">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Live Transcript</span>
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{wordCount} words</span>
                {confidence > 0 && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                    {Math.round(confidence * 100)}% confident
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {finalTranscript || interimTranscript || (
                <span className="text-gray-400 dark:text-gray-500 italic">
                  {!isSupported 
                    ? 'Speech recognition is not supported in your browser'
                    : isListening 
                      ? 'Listening... Start speaking!' 
                      : 'Click "Start Listening" to convert your speech to text'
                  }
                </span>
              )}
              {interimTranscript && (
                <span className="text-gray-500 dark:text-gray-400 italic bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">
                  {interimTranscript}
                </span>
              )}
            </div>

            {/* Real-time feedback */}
            {isListening && (
              <div className="mt-4 flex items-center space-x-2 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                <span className="text-sm font-medium ml-2">Recording in progress...</span>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">Error</h4>
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-8 space-y-4">
            {/* Primary Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={startListening}
                disabled={isListening || !isSupported}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none"
              >
                <Mic className="h-5 w-5" />
                <span>{isListening ? 'Listening...' : 'Start Listening'}</span>
              </button>

              <button
                onClick={stopListening}
                disabled={!isListening}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:transform-none"
              >
                <Square className="h-5 w-5" />
                <span>Stop Listening</span>
              </button>
            </div>

            {/* Secondary Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={copyToClipboard}
                disabled={!finalTranscript}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                onClick={speakText}
                disabled={!finalTranscript}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                <Volume2 className="h-4 w-4" />
                <span>Read Aloud</span>
              </button>

              <button
                onClick={downloadTranscript}
                disabled={!finalTranscript}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>

              <button
                onClick={clearTranscript}
                disabled={!finalTranscript && !error}
                className="flex-1 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Tips for better accuracy:</h4>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>• Speak clearly and at a moderate pace</li>
              <li>• Use a quiet environment without background noise</li>
              <li>• Keep your microphone close to your mouth</li>
              <li>• Pause briefly between sentences</li>
              <li>• Speak in your selected language consistently</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;