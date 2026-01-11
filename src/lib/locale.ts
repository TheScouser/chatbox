export const SUPPORTED_LOCALES = [
	"en",
	"es",
	"fr",
	"de",
	"it",
	"pt",
	"nl",
	"pl",
	"cs",
	"sk",
	"ru",
	"uk",
	"ja",
	"ko",
	"zh",
	"ar",
	"hi",
	"tr",
	"vi",
	"th",
	"bg",
	"ro",
	"el",
	"sr",
];

export function detectUserLocale(): string {
	// 1. Check URL param ?lang=xx
	if (typeof window !== "undefined") {
		const urlParams = new URLSearchParams(window.location.search);
		const langParam = urlParams.get("lang");
		if (langParam && isValidLocale(langParam)) {
			return langParam;
		}

		// 2. Check localStorage
		const stored = localStorage.getItem("chatbox_locale");
		if (stored && isValidLocale(stored)) {
			return stored;
		}

		// 3. Check navigator.language
		const browserLang = navigator.language.split("-")[0];
		if (isValidLocale(browserLang)) {
			return browserLang;
		}
	}

	// 4. Default
	return "en";
}

export function isValidLocale(locale: string): boolean {
	return SUPPORTED_LOCALES.includes(locale);
}

export function getBestMatchingLocale(
	availableLocales: string[],
	preferredLocale: string,
): string {
	// Exact match
	if (availableLocales.includes(preferredLocale)) {
		return preferredLocale;
	}

	// Language code match (e.g., "en-US" -> "en")
	const langCode = preferredLocale.split("-")[0];
	if (availableLocales.includes(langCode)) {
		return langCode;
	}

	// Return first available (should be default)
	return availableLocales[0] || "en";
}
