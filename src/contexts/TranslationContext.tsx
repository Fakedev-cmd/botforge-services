
import React, { createContext, useContext, useState, useEffect } from 'react';
import { allTranslations } from '../translations';

type Language = keyof typeof allTranslations;

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    console.log('Initial language from localStorage:', saved);
    const availableLangCodes = Object.keys(allTranslations) as Language[];
    if (saved && availableLangCodes.includes(saved as Language)) {
      return saved as Language;
    }
    return 'en';
  });

  const availableLanguages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];

  useEffect(() => {
    console.log('Setting language in localStorage:', language);
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const langTranslations = allTranslations[language] || allTranslations.en;
    // @ts-ignore
    const translation = langTranslations[key] || allTranslations.en[key] || key;
    console.log(`Translating "${key}" in "${language}":`, translation);
    return translation;
  };

  console.log('TranslationProvider rendering with language:', language);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </TranslationContext.Provider>
  );
};
