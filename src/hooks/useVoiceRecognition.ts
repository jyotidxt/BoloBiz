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
  const latestTranscriptRef = useRef<string>("");
  const isCancelledRef = useRef<boolean>(false);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  // Always keep callback refs current
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

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
          latestTranscriptRef.current = "";
          isCancelledRef.current = false;
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              finalTranscript += res[0].transcript;
            } else {
              interimTranscript += res[0].transcript;
            }
          }

          const currentTranscript = (finalTranscript || interimTranscript || "").trim();
          if (currentTranscript) {
            latestTranscriptRef.current = currentTranscript;
            setTranscript(currentTranscript);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          const capturedText = latestTranscriptRef.current.trim();
          
          // Auto-send captured transcript once speech ends, unless explicitly cancelled
          if (!isCancelledRef.current && capturedText) {
            onResultRef.current(capturedText);
            latestTranscriptRef.current = "";
            setTranscript("");
          }
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
          onErrorRef.current(userFriendlyError);
          setIsListening(false);
          latestTranscriptRef.current = "";
          setTranscript("");
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startListening = (langMode: "hi-IN" | "en-IN" | "auto") => {
    if (!recognitionRef.current) {
      const error = "Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.";
      setRecognitionError(error);
      onErrorRef.current(error);
      return;
    }

    // Reset cancellation flag and transcript ref before starting
    isCancelledRef.current = false;
    latestTranscriptRef.current = "";
    setTranscript("");

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
      // Calling stop() on recognition will gracefully end recording and trigger recognition.onend
      recognitionRef.current.stop();
    }
  };

  const cancelListening = () => {
    isCancelledRef.current = true;
    latestTranscriptRef.current = "";
    setTranscript("");
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        console.error("Error aborting recognition:", err);
      }
      setIsListening(false);
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
