import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const LOCALE_STORAGE_KEY = "cosmos-journal-locale";
const DEFAULT_LOCALE = "zh-TW";

const I18nContext = createContext(null);

function normalizeLocale(locale) {
  return locale === "en" ? "en-US" : "zh-TW";
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_LOCALE;
    }

    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return storedLocale === "en" || storedLocale === "zh-TW"
      ? storedLocale
      : DEFAULT_LOCALE;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = normalizeLocale(locale);
  }, [locale]);

  const changeLocale = useCallback((nextLocale) => {
    if (nextLocale !== "en" && nextLocale !== "zh-TW") {
      return;
    }

    if (nextLocale === locale) {
      return;
    }

    if (typeof window === "undefined") {
      setLocale(nextLocale);
      return;
    }

    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    window.location.reload();
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: changeLocale,
      isEnglish: locale === "en",
    }),
    [changeLocale, locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }

  return context;
}

export function formatLocaleDate(value, locale, options) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(normalizeLocale(locale), options);
}

export function formatLocaleDateTime(value, locale, options) {
  if (!value) return "";
  return new Date(value).toLocaleString(normalizeLocale(locale), options);
}
