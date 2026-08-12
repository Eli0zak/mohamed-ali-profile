import { useEffect, useState } from "react";

export type Language = "en" | "ar";

const STORAGE_KEY = "mohamed-ali-language";

function readLanguage(): Language {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(readLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return [language, setLanguage] as const;
}

export function toggleLanguage(language: Language): Language {
  return language === "en" ? "ar" : "en";
}
