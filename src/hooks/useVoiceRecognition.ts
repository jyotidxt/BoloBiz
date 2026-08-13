"use client";

import { useState, useEffect, useRef } from "react";

interface UseVoiceRecognitionProps {
  onResult: (transcript: string) => void;
  onError: (errorMsg: string) => void;
}

export function useVoiceRecognition({ onResult, onError }: UseVoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
          setRecognitionError(null);
          setTranscript("");
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          let userFriendlyError = "An error occurred with voice recognition.";
          
          if (event.error === "not-allowed" || event.error === "permission-denied") {
            userFriendlyError = "Microphone access is required for voice commands. Please allow microphone access in your browser settings and try again.";
          } else if (event.error === "no-speech") {
            userFriendlyError = "मैंने कुछ सुना नहीं। कृपया फिर से बोलें। (No speech detected. Please try again.)";
          }

          setRecognitionError(userFriendlyError);
          onError(userFriendlyError);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onError]);

  const startListening = (langMode: "hi-IN" | "en-IN" | "auto") => {
    if (!recognitionRef.current) {
      const error = "Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.";
      setRecognitionError(error);
      onError(error);
      return;
    }

    // Resolve Auto-detection language safely
    let targetLang = "hi-IN"; // Default to hi-IN which handles Hinglish/Hindi
    if (langMode === "en-IN") {
      targetLang = "en-IN";
    } else if (langMode === "auto") {
      if (typeof navigator !== "undefined" && navigator.language?.startsWith("hi")) {
        targetLang = "hi-IN";
      }
    }

    recognitionRef.current.lang = targetLang;

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      // Execute the result callback immediately with the final transcribed string
      setTimeout(() => {
        if (transcript.trim()) {
          onResult(transcript);
        }
      }, 400);
    }
  };

  const cancelListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
      setTranscript("");
    }
  };

  return {
    isListening,
    transcript,
    error: recognitionError,
    startListening,
    stopListening,
    cancelListening,
    isSupported: typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
  };
}
