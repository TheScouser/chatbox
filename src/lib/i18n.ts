import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { detectUserLocale } from './locale';

// Import translation files
import enTranslations from '../locales/en.json';
import bgTranslations from '../locales/bg.json';
import esTranslations from '../locales/es.json';
import frTranslations from '../locales/fr.json';
import deTranslations from '../locales/de.json';
import itTranslations from '../locales/it.json';
import ptTranslations from '../locales/pt.json';
import nlTranslations from '../locales/nl.json';
import plTranslations from '../locales/pl.json';
import csTranslations from '../locales/cs.json';
import skTranslations from '../locales/sk.json';
import ruTranslations from '../locales/ru.json';
import ukTranslations from '../locales/uk.json';
import jaTranslations from '../locales/ja.json';
import koTranslations from '../locales/ko.json';
import zhTranslations from '../locales/zh.json';
import arTranslations from '../locales/ar.json';
import hiTranslations from '../locales/hi.json';
import trTranslations from '../locales/tr.json';
import viTranslations from '../locales/vi.json';
import thTranslations from '../locales/th.json';
import roTranslations from '../locales/ro.json';
import elTranslations from '../locales/el.json';
import srTranslations from '../locales/sr.json';

const resources = {
  en: { translation: enTranslations },
  bg: { translation: bgTranslations },
  es: { translation: esTranslations },
  fr: { translation: frTranslations },
  de: { translation: deTranslations },
  it: { translation: itTranslations },
  pt: { translation: ptTranslations },
  nl: { translation: nlTranslations },
  pl: { translation: plTranslations },
  cs: { translation: csTranslations },
  sk: { translation: skTranslations },
  ru: { translation: ruTranslations },
  uk: { translation: ukTranslations },
  ja: { translation: jaTranslations },
  ko: { translation: koTranslations },
  zh: { translation: zhTranslations },
  ar: { translation: arTranslations },
  hi: { translation: hiTranslations },
  tr: { translation: trTranslations },
  vi: { translation: viTranslations },
  th: { translation: thTranslations },
  ro: { translation: roTranslations },
  el: { translation: elTranslations },
  sr: { translation: srTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: detectUserLocale(), // Use our custom locale detection
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      lookupLocalStorage: 'chatbox_locale',
      caches: ['localStorage'],
    },
  });

export default i18n;
