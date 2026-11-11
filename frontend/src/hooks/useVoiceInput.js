// ==============================================================================
// Voice Input & Speech Synthesis Hook (useVoiceInput.js)
// Enables Web Speech API voice dictation for complaint filing and audio status readout
// ==============================================================================

import { useState, useRef, useEffect, useCallback } from 'react';

export function useVoiceInput(options = {}) {
  const { lang = 'en-IN', onTranscript } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorNotice('');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        if (onTranscript) {
          onTranscript(currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorNotice('Microphone access denied. Please grant microphone permissions.');
        } else if (event.error === 'no-speech') {
          setErrorNotice('No speech detected. Please try again.');
        } else {
          setErrorNotice(`Speech error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang, onTranscript]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setErrorNotice('Voice recognition is not supported in this browser.');
      return;
    }
    setErrorNotice('');
    try {
      recognitionRef.current.start();
    } catch {
      // If already started, restart
      recognitionRef.current.stop();
      setTimeout(() => recognitionRef.current.start(), 200);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speakText = useCallback((text, speechLang = 'en-IN') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    errorNotice,
    startListening,
    stopListening,
    speakText,
  };
}

