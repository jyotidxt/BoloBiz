"use client";

import { useState, useEffect, useRef } from "react";

export function useVoiceSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speak = (
    text: string,
    voiceResponsesEnabled: boolean,
    onEnd?: () => void
  ) => {
    if (!voiceResponsesEnabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    try {
      // Clear any active speaking streams safely
      window.speechSynthesis.cancel();

      const cleanText = text.replace(/[*#_`]/g, "").trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;

      // Detect Hindi unicode characters to match vocal dialect
      const isHindi = /[\u0900-\u097F]/.test(cleanText);
      utterance.lang = isHindi ? "hi-IN" : "en-IN";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Choose appropriate voice if loaded in browser
      const voices = window.speechSynthesis.getVoices();
      if (isHindi) {
        const hindiVoice = voices.find(
          (v) => v.lang.includes("hi-IN") || v.lang.includes("hi")
        );
        if (hindiVoice) utterance.voice = hindiVoice;
      } else {
        const englishVoice = voices.find(
          (v) => v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.lang.includes("en-US")
        );
        if (englishVoice) utterance.voice = englishVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        // "canceled" or "interrupted" are normal lifecycle events when stopping or replacing audio
        if (e.error === "canceled" || e.error === "interrupted") {
          setIsSpeaking(false);
          return;
        }
        console.warn("Speech Synthesis non-fatal notification:", e.error);
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis could not initialize:", err);
      setIsSpeaking(false);
    }
  };

  // Re-fetch voices when the browser loads them dynamically and cleanup on unmount
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
      
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  return {
    isSpeaking,
    speak,
    stop,
    isSupported: typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined",
  };
}
