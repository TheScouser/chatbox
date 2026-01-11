import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { detectUserLocale } from "./locale";

// Import translation files
import enTranslations from "../locales/en.json";
import bgTranslations from "../locales/bg.json";
import csTranslations from "../locales/cs.json";
import deTranslations from "../locales/de.json";
import elTranslations from "../locales/el.json";
import esTranslations from "../locales/es.json";
import frTranslations from "../locales/fr.json";
import itTranslations from "../locales/it.json";
import nlTranslations from "../locales/nl.json";
import plTranslations from "../locales/pl.json";
import ptTranslations from "../locales/pt.json";
import roTranslations from "../locales/ro.json";
import ruTranslations from "../locales/ru.json";
import skTranslations from "../locales/sk.json";
import srTranslations from "../locales/sr.json";
import trTranslations from "../locales/tr.json";
import ukTranslations from "../locales/uk.json";

const resources = {
	en: { translation: enTranslations },
	bg: { translation: bgTranslations },
	cs: { translation: csTranslations },
	de: { translation: deTranslations },
	el: { translation: elTranslations },
	es: { translation: esTranslations },
	fr: { translation: frTranslations },
	it: { translation: itTranslations },
	nl: { translation: nlTranslations },
	pl: { translation: plTranslations },
	pt: { translation: ptTranslations },
	ro: { translation: roTranslations },
	ru: { translation: ruTranslations },
	sk: { translation: skTranslations },
	sr: { translation: srTranslations },
	tr: { translation: trTranslations },
	uk: { translation: ukTranslations },
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: "en",
		lng: detectUserLocale(), // Use our custom locale detection
		interpolation: {
			escapeValue: false, // React already escapes
		},
		detection: {
			lookupLocalStorage: "chatbox_locale",
			caches: ["localStorage"],
		},
	});

export default i18n;
