import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	actualTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: Theme;
}

export function ThemeProvider({
	children,
	defaultTheme = "dark", // Default to dark theme
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
		// Check localStorage first, then default
		const stored = localStorage.getItem("chatbox-theme") as Theme;
		return stored || defaultTheme;
	});

	// Calculate actual theme based on system preference
	const [actualTheme, setActualTheme] = useState<"light" | "dark">(() => {
		if (theme === "system") {
			try {
				if (
					typeof window !== "undefined" &&
					typeof window.matchMedia === "function"
				) {
					return window.matchMedia("(prefers-color-scheme: dark)").matches
						? "dark"
						: "light";
				}
			} catch (_) {}
			return "light";
		}
		return theme;
	});

	useEffect(() => {
		// Only listen to system changes when theme follows system
		if (theme !== "system") return;
		if (
			typeof window === "undefined" ||
			typeof window.matchMedia !== "function"
		)
			return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			setActualTheme(mediaQuery.matches ? "dark" : "light");
		};

		if (typeof mediaQuery.addEventListener === "function") {
			mediaQuery.addEventListener("change", handleChange);
			return () => mediaQuery.removeEventListener("change", handleChange);
		}
		// Fallback for older environments
		if (typeof (mediaQuery as any).addListener === "function") {
			(mediaQuery as any).addListener(handleChange);
			return () => (mediaQuery as any).removeListener(handleChange);
		}
		return;
	}, [theme]);

	useEffect(() => {
		// Update actualTheme when theme changes
		if (theme === "system") {
			setActualTheme(
				window.matchMedia("(prefers-color-scheme: dark)").matches
					? "dark"
					: "light",
			);
		} else {
			setActualTheme(theme);
		}
	}, [theme]);

	useEffect(() => {
		// Apply theme to document
		const root = document.documentElement;

		// Remove existing theme classes
		root.classList.remove("light", "dark");

		// Add current theme class
		root.classList.add(actualTheme);

		// Store theme preference
		localStorage.setItem("chatbox-theme", theme);
	}, [theme, actualTheme]);

	const handleSetTheme = (newTheme: Theme) => {
		setTheme(newTheme);
	};

	return (
		<ThemeContext.Provider
			value={{
				theme,
				setTheme: handleSetTheme,
				actualTheme,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
