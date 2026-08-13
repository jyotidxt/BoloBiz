"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, LocaleDictionary } from "@/i18n/translations";

type UILanguage = "en" | "hi";
type AILanguage = "auto" | "en" | "hi" | "hinglish";

interface LanguageContextType {
  language: UILanguage;
  setLanguage: (lang: UILanguage) => void;
  aiLanguage: AILanguage;
  setAiLanguage: (lang: AILanguage) => void;
  t: (keyPath: string) => string;
  tArray: (keyPath: string) => string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<UILanguage>("en");
  const [aiLanguage, setAiLanguageState] = useState<AILanguage>("auto");

  // Load persisted languages on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("bolobiz_ui_lang") as UILanguage;
      if (savedLang === "en" || savedLang === "hi") {
        setLanguageState(savedLang);
      }

      const savedAiLang = localStorage.getItem("bolobiz_ai_lang") as AILanguage;
      if (savedAiLang === "auto" || savedAiLang === "en" || savedAiLang === "hi" || savedAiLang === "hinglish") {
        setAiLanguageState(savedAiLang);
      }
    }
  }, []);

  const setLanguage = (lang: UILanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("bolobiz_ui_lang", lang);
    }
  };

  const setAiLanguage = (lang: AILanguage) => {
    setAiLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("bolobiz_ai_lang", lang);
    }
  };

  // Safe translation key path retriever
  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, part) => {
      return acc && acc[part] !== undefined ? acc[part] : undefined;
    }, obj);
  };

  const t = (keyPath: string): string => {
    // 1. Try active language
    let val = getNestedValue(translations[language], keyPath);
    if (val !== undefined && typeof val === "string") return val;

    // 2. Fall back to English
    val = getNestedValue(translations["en"], keyPath);
    if (val !== undefined && typeof val === "string") return val;

    // 3. Fall back to the key string itself
    return keyPath;
  };

  const tArray = (keyPath: string): string[] => {
    let val = getNestedValue(translations[language], keyPath);
    if (val !== undefined && Array.isArray(val)) return val;

    val = getNestedValue(translations["en"], keyPath);
    if (val !== undefined && Array.isArray(val)) return val;

    return [];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, aiLanguage, setAiLanguage, t, tArray }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
