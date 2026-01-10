export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "bg", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬" },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", flag: "🇸🇰" },
  { code: "sr", name: "Serbian", nativeName: "Српски", flag: "🇷🇸" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦" },
];

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find(lang => lang.code === code);
}

export function getLanguageName(code: string): string {
  return getLanguageByCode(code)?.name || code.toUpperCase();
}
